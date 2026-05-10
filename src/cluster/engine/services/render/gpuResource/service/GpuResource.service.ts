import {
    createLifecycle,
    type LifecycleActivePhase,
    type LifecycleLivePhase,
} from "../../../../controllers/Lifecycle.controller";
import {
    bufferKindToWebGlTarget,
    createWebGl2Buffer,
    createWebGl2Sampler,
    createWebGl2Texture,
    deleteWebGl2Buffer as deleteWebGl2NativeBuffer,
    deleteWebGl2Sampler as deleteWebGl2NativeSampler,
    deleteWebGl2Texture as deleteWebGl2NativeTexture,
    uploadUsageToWebGlUsage,
    uploadWebGl2Texture as uploadWebGl2NativeTexture,
} from "../modules/WebGl2Resource.module";
import type {
    GpuBufferBackendState,
    GpuBufferDesc,
    GpuBufferHandle,
    GpuResourceConfig,
    GpuResourceContextState,
    GpuResourceHandle,
    GpuResourceSyncArgs,
    GpuSamplerBackendState,
    GpuSamplerDesc,
    GpuSamplerHandle,
    GpuTextureBackendState,
    GpuTextureDesc,
    GpuTextureFormat,
    GpuTextureHandle,
    GpuTextureResourceConfig,
    GpuUploadRequest,
    WebGl2TextureBinding,
} from "./GpuResource.types";

export type GpuResourceService = Readonly<{
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    sync(args: GpuResourceSyncArgs): void;
    beginFrame(): void;
    registerTextureResource(config: GpuTextureResourceConfig): GpuTextureHandle;
    createBuffer(desc: GpuBufferDesc): GpuBufferHandle;
    stageUpload(request: GpuUploadRequest): void;
    flushWebGl2Uploads(gl: WebGL2RenderingContext): void;
    getWebGl2Buffer(
        handle: GpuBufferHandle,
        gl: WebGL2RenderingContext,
    ): WebGLBuffer | undefined;
    resolveWebGl2Texture(
        resourceId: string | undefined,
        gl: WebGL2RenderingContext,
    ): WebGl2TextureBinding | undefined;
    release(handle: GpuResourceHandle): boolean;
    dispose(): Promise<boolean>;
}>;

type TextureRecord = {
    desc: Required<Pick<GpuTextureDesc, "width" | "height" | "format">> &
        Pick<GpuTextureDesc, "label" | "usage">;
    sampler?: GpuSamplerHandle;
    invalidated: boolean;
    native: GpuTextureBackendState;
    retainedUpload?: RetainedTextureUpload;
};

type BufferRecord = {
    desc: GpuBufferDesc;
    invalidated: boolean;
    native: GpuBufferBackendState;
};

type SamplerRecord = {
    desc: GpuSamplerDesc;
    invalidated: boolean;
    native: GpuSamplerBackendState;
};

type RetainedTextureUpload = {
    width: number;
    height: number;
    format: GpuTextureFormat;
    data: ArrayBufferView;
};

const FALLBACK_TEXTURE_RESOURCE_ID = "cluster.render.fallbackTexture";
const FALLBACK_TEXTURE_DATA = new Uint8Array([255, 0, 255, 255]);

function createGpuResourceService(config: GpuResourceConfig): GpuResourceService {
    const debug = config.debug ?? false;
    let contextState: GpuResourceContextState = "lost";
    let nextTextureId = 0;
    let nextBufferId = 0;
    let nextSamplerId = 0;
    let fallbackTexture: GpuTextureHandle | undefined;
    let lastWebGl2Context: WebGL2RenderingContext | undefined;

    const textures = new Map<GpuTextureHandle, TextureRecord>();
    const buffers = new Map<GpuBufferHandle, BufferRecord>();
    const samplers = new Map<GpuSamplerHandle, SamplerRecord>();
    const textureResources = new Map<string, GpuTextureHandle>();
    const transientBuffers = new Set<GpuBufferHandle>();
    const pendingUploads: GpuUploadRequest[] = [];

    function normalizePositiveInteger(value: number, label: string): number {
        if (Number.isFinite(value) && value > 0) {
            return Math.max(1, Math.round(value));
        }
        if (debug) {
            throw new Error(
                `GpuResourceService: ${label} must be a finite positive number`,
            );
        }
        return 1;
    }

    function createTextureHandle(): GpuTextureHandle {
        return `gpu-texture:${++nextTextureId}`;
    }

    function createBufferHandle(): GpuBufferHandle {
        return `gpu-buffer:${++nextBufferId}`;
    }

    function createSamplerHandle(): GpuSamplerHandle {
        return `gpu-sampler:${++nextSamplerId}`;
    }

    function assertRunning(methodName: string): boolean {
        if (lifecycle.isRunning()) return true;
        if (debug) {
            throw new Error(
                `GpuResourceService: invalid ${methodName} call - service is not running`,
            );
        }
        return false;
    }

    function markAllInvalidated(): void {
        for (const record of textures.values()) record.invalidated = true;
        for (const record of buffers.values()) record.invalidated = true;
        for (const record of samplers.values()) record.invalidated = true;
    }

    function clearPendingUploads(): void {
        pendingUploads.length = 0;
    }

    function deleteWebGl2Buffer(
        record: BufferRecord | undefined,
        gl = lastWebGl2Context,
    ): void {
        const buffer = record?.native.webgl2?.buffer;
        deleteWebGl2NativeBuffer(gl, buffer);
        if (record?.native.webgl2) record.native.webgl2.buffer = undefined;
    }

    function deleteWebGl2Texture(
        record: TextureRecord | undefined,
        gl = lastWebGl2Context,
    ): void {
        const texture = record?.native.webgl2?.texture;
        deleteWebGl2NativeTexture(gl, texture);
        if (record?.native.webgl2) record.native.webgl2.texture = undefined;
    }

    function deleteWebGl2Sampler(
        record: SamplerRecord | undefined,
        gl = lastWebGl2Context,
    ): void {
        const sampler = record?.native.webgl2?.sampler;
        deleteWebGl2NativeSampler(gl, sampler);
        if (record?.native.webgl2) record.native.webgl2.sampler = undefined;
    }

    function deleteWebGl2Objects(gl = lastWebGl2Context): void {
        for (const record of buffers.values()) deleteWebGl2Buffer(record, gl);
        for (const record of textures.values()) deleteWebGl2Texture(record, gl);
        for (const record of samplers.values()) deleteWebGl2Sampler(record, gl);
    }

    function releaseTransientBuffers(): void {
        for (const handle of transientBuffers) {
            deleteWebGl2Buffer(buffers.get(handle));
            buffers.delete(handle);
        }
        transientBuffers.clear();
    }

    function createTexture(desc: GpuTextureDesc): GpuTextureHandle {
        lifecycle.assertNotDisposed();
        const handle = createTextureHandle();
        textures.set(handle, {
            desc: {
                label: desc.label,
                width: normalizePositiveInteger(desc.width, "texture width"),
                height: normalizePositiveInteger(desc.height, "texture height"),
                format: desc.format ?? "rgba8",
                usage: desc.usage ?? ["sampled", "copy-dst"],
            },
            invalidated: contextState !== "ok",
            native: {},
        });
        return handle;
    }

    function createSampler(desc: GpuSamplerDesc): GpuSamplerHandle {
        lifecycle.assertNotDisposed();
        const handle = createSamplerHandle();
        samplers.set(handle, {
            desc,
            invalidated: contextState !== "ok",
            native: {},
        });
        return handle;
    }

    const lifecycle = createLifecycle({
        tag: "GpuResourceService",
        debug,
        onStart: () => {
            contextState = "ok";
            clearPendingUploads();
            releaseTransientBuffers();
            deleteWebGl2Objects();
            markAllInvalidated();
        },
        onStop: (_from: LifecycleActivePhase) => {
            contextState = "lost";
            clearPendingUploads();
            releaseTransientBuffers();
            deleteWebGl2Objects();
            markAllInvalidated();
        },
        onDispose: (_from: LifecycleLivePhase) => {
            contextState = "lost";
            clearPendingUploads();
            releaseTransientBuffers();
            deleteWebGl2Objects();
            textures.clear();
            buffers.clear();
            samplers.clear();
            textureResources.clear();
            fallbackTexture = undefined;
        },
    });

    function sync(args: GpuResourceSyncArgs): void {
        lifecycle.assertNotDisposed();
        if (!assertRunning("sync") || args.gfxStatus === contextState) return;
        contextState = args.gfxStatus;
        if (contextState === "lost") {
            clearPendingUploads();
            releaseTransientBuffers();
            deleteWebGl2Objects();
            markAllInvalidated();
            return;
        }
        markAllInvalidated();
    }

    function beginFrame(): void {
        lifecycle.assertNotDisposed();
        if (!assertRunning("beginFrame")) return;
        releaseTransientBuffers();
    }

    function registerTextureResource(
        config: GpuTextureResourceConfig,
    ): GpuTextureHandle {
        lifecycle.assertNotDisposed();
        const id = config.id.trim();
        if (!id && debug) {
            throw new Error("GpuResourceService: texture resource id is required");
        }

        const existing = id ? textureResources.get(id) : undefined;
        if (existing) release(existing);

        const sampler = createSampler({
            label: config.label ? `${config.label}.sampler` : undefined,
            minFilter: config.minFilter,
            magFilter: config.magFilter,
        });
        const handle = createTexture(config);
        const record = textures.get(handle);
        if (record) record.sampler = sampler;
        if (id) textureResources.set(id, handle);
        stageUpload({
            kind: "texture",
            target: handle,
            width: config.width,
            height: config.height,
            format: config.format,
            data: config.data,
            retain: true,
        });
        return handle;
    }

    function createBuffer(desc: GpuBufferDesc): GpuBufferHandle {
        lifecycle.assertNotDisposed();
        const handle = createBufferHandle();
        buffers.set(handle, {
            desc: {
                label: desc.label,
                size: normalizePositiveInteger(desc.size, "buffer size"),
                kind: desc.kind,
            },
            invalidated: contextState !== "ok",
            native: {},
        });
        transientBuffers.add(handle);
        return handle;
    }

    function stageUpload(request: GpuUploadRequest): void {
        lifecycle.assertNotDisposed();
        if (!assertRunning("stageUpload")) return;
        if (contextState !== "ok") {
            if (debug) {
                throw new Error(
                    "GpuResourceService: cannot stage uploads while gfx is lost",
                );
            }
            return;
        }
        pendingUploads.push(request);
        if (request.kind === "texture" && request.retain) {
            const record = textures.get(request.target);
            if (record) {
                record.retainedUpload = {
                    width: request.width ?? record.desc.width,
                    height: request.height ?? record.desc.height,
                    format: request.format ?? record.desc.format,
                    data: request.data,
                };
                record.invalidated = true;
            }
        }
    }

    function getWebGl2Buffer(
        handle: GpuBufferHandle,
        gl: WebGL2RenderingContext,
    ): WebGLBuffer | undefined {
        lifecycle.assertNotDisposed();
        if (!assertRunning("getWebGl2Buffer")) return undefined;
        lastWebGl2Context = gl;
        const record = buffers.get(handle);
        if (!record) return undefined;
        if (record.native.webgl2?.buffer) return record.native.webgl2.buffer;
        const buffer = createWebGl2Buffer(gl);
        if (!buffer) {
            if (debug) {
                throw new Error("GpuResourceService: failed to create WebGL buffer");
            }
            return undefined;
        }
        record.native.webgl2 = { buffer };
        return buffer;
    }

    function getWebGl2Sampler(
        handle: GpuSamplerHandle | undefined,
        gl: WebGL2RenderingContext,
    ): WebGLSampler | undefined {
        if (!handle) return undefined;
        const record = samplers.get(handle);
        if (!record) return undefined;
        if (record.native.webgl2?.sampler) return record.native.webgl2.sampler;
        const sampler = createWebGl2Sampler(gl, record.desc);
        if (!sampler) return undefined;
        record.native.webgl2 = { sampler };
        record.invalidated = false;
        return sampler;
    }

    function uploadWebGl2Texture(
        gl: WebGL2RenderingContext,
        handle: GpuTextureHandle,
        upload: RetainedTextureUpload,
    ): void {
        const record = textures.get(handle);
        const texture = record?.native.webgl2?.texture ?? getWebGl2Texture(handle, gl);
        if (!record || !texture) return;
        const sampler = record.sampler ? samplers.get(record.sampler) : undefined;
        uploadWebGl2NativeTexture(gl, texture, sampler?.desc, upload);
        record.invalidated = false;
    }

    function getWebGl2Texture(
        handle: GpuTextureHandle,
        gl: WebGL2RenderingContext,
    ): WebGLTexture | undefined {
        lifecycle.assertNotDisposed();
        if (!assertRunning("getWebGl2Texture")) return undefined;
        lastWebGl2Context = gl;
        const record = textures.get(handle);
        if (!record) return undefined;
        if (!record.native.webgl2?.texture) {
            const texture = createWebGl2Texture(gl);
            if (!texture) return undefined;
            record.native.webgl2 = { texture };
            record.invalidated = true;
        }
        if (record.retainedUpload && record.invalidated) {
            uploadWebGl2Texture(gl, handle, record.retainedUpload);
        }
        return record.native.webgl2.texture;
    }

    function createFallbackTexture(): GpuTextureHandle {
        const existing = textureResources.get(FALLBACK_TEXTURE_RESOURCE_ID);
        if (existing) return existing;
        const handle = createTexture({
            label: "render.fallbackTexture",
            width: 1,
            height: 1,
            format: "rgba8",
        });
        const sampler = createSampler({
            label: "render.fallbackTexture.sampler",
            minFilter: "nearest",
            magFilter: "nearest",
        });
        const record = textures.get(handle);
        if (record) {
            record.sampler = sampler;
            record.retainedUpload = {
                width: 1,
                height: 1,
                format: "rgba8",
                data: FALLBACK_TEXTURE_DATA,
            };
            record.invalidated = true;
        }
        textureResources.set(FALLBACK_TEXTURE_RESOURCE_ID, handle);
        fallbackTexture = handle;
        return handle;
    }

    function resolveWebGl2Texture(
        resourceId: string | undefined,
        gl: WebGL2RenderingContext,
    ): WebGl2TextureBinding | undefined {
        lifecycle.assertNotDisposed();
        if (!assertRunning("resolveWebGl2Texture")) return undefined;
        const handle =
            resourceId === undefined ? undefined : textureResources.get(resourceId);
        const resolvedHandle = handle ?? fallbackTexture ?? createFallbackTexture();
        const texture = getWebGl2Texture(resolvedHandle, gl);
        const record = textures.get(resolvedHandle);
        if (!texture || !record) return undefined;
        return {
            texture,
            sampler: getWebGl2Sampler(record.sampler, gl),
            fallback: handle === undefined,
        };
    }

    function flushWebGl2Uploads(gl: WebGL2RenderingContext): void {
        lifecycle.assertNotDisposed();
        if (!assertRunning("flushWebGl2Uploads") || pendingUploads.length === 0) {
            return;
        }

        const uploads = pendingUploads.splice(0);
        for (const upload of uploads) {
            if (upload.kind === "texture") {
                const record = textures.get(upload.target);
                if (!record) continue;
                if (upload.retain) {
                    record.retainedUpload = {
                        width: upload.width ?? record.desc.width,
                        height: upload.height ?? record.desc.height,
                        format: upload.format ?? record.desc.format,
                        data: upload.data,
                    };
                }
                uploadWebGl2Texture(gl, upload.target, {
                    width: upload.width ?? record.desc.width,
                    height: upload.height ?? record.desc.height,
                    format: upload.format ?? record.desc.format,
                    data: upload.data,
                });
                continue;
            }

            const record = buffers.get(upload.target);
            if (!record) continue;
            const target = bufferKindToWebGlTarget(gl, record.desc.kind);
            const buffer = getWebGl2Buffer(upload.target, gl);
            if (!target || !buffer || !record) continue;
            gl.bindBuffer(target, buffer);
            gl.bufferData(target, upload.data, uploadUsageToWebGlUsage(gl, upload.usage));
            record.invalidated = false;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    function release(handle: GpuResourceHandle): boolean {
        lifecycle.assertNotDisposed();
        if (handle.startsWith("gpu-texture:")) {
            const textureHandle = handle as GpuTextureHandle;
            for (const [id, mappedHandle] of textureResources) {
                if (mappedHandle === textureHandle) textureResources.delete(id);
            }
            if (fallbackTexture === textureHandle) fallbackTexture = undefined;
            const record = textures.get(textureHandle);
            deleteWebGl2Texture(record);
            if (record?.sampler) release(record.sampler);
            return textures.delete(textureHandle);
        }
        if (handle.startsWith("gpu-buffer:")) {
            const bufferHandle = handle as GpuBufferHandle;
            transientBuffers.delete(bufferHandle);
            deleteWebGl2Buffer(buffers.get(bufferHandle));
            return buffers.delete(bufferHandle);
        }
        if (handle.startsWith("gpu-sampler:")) {
            const samplerHandle = handle as GpuSamplerHandle;
            deleteWebGl2Sampler(samplers.get(samplerHandle));
            return samplers.delete(samplerHandle);
        }
        return false;
    }

    return Object.freeze({
        start: lifecycle.start,
        stop: lifecycle.stop,
        sync,
        beginFrame,
        registerTextureResource,
        createBuffer,
        stageUpload,
        flushWebGl2Uploads,
        getWebGl2Buffer,
        resolveWebGl2Texture,
        release,
        dispose: lifecycle.dispose,
    });
}

export function createGpuResource(
    config: GpuResourceConfig = {},
): GpuResourceService {
    return createGpuResourceService(config);
}
