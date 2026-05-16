import {
    createLifecycle,
    type LifecycleActivePhase,
    type LifecycleLivePhase,
} from "../../../../../controllers/Lifecycle.controller";
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
    GpuFrameVertexLayoutKey,
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
    WebGl2UnitQuadGeometry,
    WebGpuBindGroupLike,
    WebGpuDeviceLike,
    WebGpuFrameVertexBuffer,
    WebGpuUnitQuadGeometry,
    WebGpuTextureBinding,
    WebGl2FrameVertexBuffer,
} from "./GpuResource.types";
import { RENDER_2D_UNIT_QUAD_VERTEX_DATA } from "../../../modules/Render2DInstancePacking.module";

export type GpuResourceService = Readonly<{
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    sync(args: GpuResourceSyncArgs): void;
    beginFrame(): void;
    registerTextureResource(config: GpuTextureResourceConfig): GpuTextureHandle;
    createBuffer(desc: GpuBufferDesc): GpuBufferHandle;
    stageUpload(request: GpuUploadRequest): void;
    flushWebGl2Uploads(gl: WebGL2RenderingContext): void;
    flushWebGpuUploads(device: WebGpuDeviceLike): void;
    getWebGl2Buffer(
        handle: GpuBufferHandle,
        gl: WebGL2RenderingContext,
    ): WebGLBuffer | undefined;
    getWebGpuFrameVertexBuffer(args: {
        layout: GpuFrameVertexLayoutKey;
        device: WebGpuDeviceLike;
        byteLength: number;
    }): WebGpuFrameVertexBuffer | undefined;
    getWebGl2FrameVertexBuffer(args: {
        layout: GpuFrameVertexLayoutKey;
        gl: WebGL2RenderingContext;
        byteLength: number;
    }): WebGl2FrameVertexBuffer | undefined;
    getWebGl2UnitQuadGeometry(
        gl: WebGL2RenderingContext,
    ): WebGl2UnitQuadGeometry | undefined;
    getWebGpuUnitQuadGeometry(
        device: WebGpuDeviceLike,
    ): WebGpuUnitQuadGeometry | undefined;
    resolveWebGl2Texture(
        resourceId: string | undefined,
        gl: WebGL2RenderingContext,
    ): WebGl2TextureBinding | undefined;
    resolveWebGpuTexture(args: {
        resourceId: string | undefined;
        device: WebGpuDeviceLike;
        bindGroupLayout?: object;
    }): WebGpuTextureBinding | undefined;
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

type UnitQuadGeometryRecord = {
    webgl2?: WebGl2UnitQuadGeometry;
    webgpu?: WebGpuUnitQuadGeometry;
};

const FALLBACK_TEXTURE_RESOURCE_ID = "cluster.render.fallbackTexture";
const FALLBACK_TEXTURE_DATA = new Uint8Array([255, 0, 255, 255]);
const WEBGPU_BUFFER_USAGE_VERTEX_COPY_DST = 0x20 | 0x8;
const WEBGPU_BUFFER_USAGE_INDEX_COPY_DST = 0x10 | 0x8;
const WEBGPU_TEXTURE_USAGE_TEXTURE_BINDING_COPY_DST = 0x4 | 0x2;
const UNIT_QUAD_INDEX_DATA = new Uint16Array([0, 1, 2, 2, 1, 3]);

function createGpuResourceService(
    config: GpuResourceConfig,
): GpuResourceService {
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
    const frameVertexBuffers = new Map<GpuFrameVertexLayoutKey, BufferRecord>();
    const unitQuadGeometry: UnitQuadGeometryRecord = {};

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
        if (record?.native.webgl2) {
            record.native.webgl2.buffer = undefined;
            record.native.webgl2.capacityBytes = undefined;
        }
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

    function deleteWebGpuBuffer(record: BufferRecord | undefined): void {
        record?.native.webgpu?.buffer?.destroy?.();
        if (record?.native.webgpu) {
            record.native.webgpu.buffer = undefined;
            record.native.webgpu.capacityBytes = undefined;
        }
    }

    function deleteWebGpuTexture(record: TextureRecord | undefined): void {
        record?.native.webgpu?.texture?.destroy?.();
        if (record?.native.webgpu) {
            record.native.webgpu.texture = undefined;
            record.native.webgpu.view = undefined;
            record.native.webgpu.bindGroup = undefined;
        }
    }

    function deleteWebGpuObjects(): void {
        for (const record of buffers.values()) deleteWebGpuBuffer(record);
        for (const record of textures.values()) deleteWebGpuTexture(record);
        for (const record of samplers.values()) {
            if (record.native.webgpu) record.native.webgpu.sampler = undefined;
        }
    }

    function deleteFrameVertexBuffers(gl = lastWebGl2Context): void {
        for (const record of frameVertexBuffers.values()) {
            deleteWebGl2Buffer(record, gl);
            deleteWebGpuBuffer(record);
        }
        frameVertexBuffers.clear();
    }

    function deleteUnitQuadGeometry(gl = lastWebGl2Context): void {
        deleteWebGl2NativeBuffer(gl, unitQuadGeometry.webgl2?.vertexBuffer);
        deleteWebGl2NativeBuffer(gl, unitQuadGeometry.webgl2?.indexBuffer);
        unitQuadGeometry.webgpu?.vertexBuffer.destroy?.();
        unitQuadGeometry.webgpu?.indexBuffer.destroy?.();
        unitQuadGeometry.webgl2 = undefined;
        unitQuadGeometry.webgpu = undefined;
    }

    function releaseTransientBuffers(): void {
        for (const handle of transientBuffers) {
            deleteWebGl2Buffer(buffers.get(handle));
            deleteWebGpuBuffer(buffers.get(handle));
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
            deleteWebGpuObjects();
            deleteFrameVertexBuffers();
            deleteUnitQuadGeometry();
            markAllInvalidated();
        },
        onStop: (_from: LifecycleActivePhase) => {
            contextState = "lost";
            clearPendingUploads();
            releaseTransientBuffers();
            deleteWebGl2Objects();
            deleteWebGpuObjects();
            deleteFrameVertexBuffers();
            deleteUnitQuadGeometry();
            markAllInvalidated();
        },
        onDispose: (_from: LifecycleLivePhase) => {
            contextState = "lost";
            clearPendingUploads();
            releaseTransientBuffers();
            deleteWebGl2Objects();
            deleteWebGpuObjects();
            deleteFrameVertexBuffers();
            deleteUnitQuadGeometry();
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
            deleteWebGpuObjects();
            deleteFrameVertexBuffers();
            deleteUnitQuadGeometry();
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
            throw new Error(
                "GpuResourceService: texture resource id is required",
            );
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
                throw new Error(
                    "GpuResourceService: failed to create WebGL buffer",
                );
            }
            return undefined;
        }
        record.native.webgl2 = { buffer };
        return buffer;
    }

    function createWebGpuBuffer(
        device: WebGpuDeviceLike,
        label: string | undefined,
        byteLength: number,
    ) {
        try {
            return device.createBuffer({
                label,
                size: normalizePositiveInteger(
                    byteLength,
                    "WebGPU buffer size",
                ),
                usage: WEBGPU_BUFFER_USAGE_VERTEX_COPY_DST,
            });
        } catch (error) {
            if (debug) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "unknown buffer error";
                throw new Error(
                    `GpuResourceService: failed to create WebGPU buffer - ${message}`,
                );
            }
            return undefined;
        }
    }

    function getWebGl2FrameVertexBuffer(args: {
        layout: GpuFrameVertexLayoutKey;
        gl: WebGL2RenderingContext;
        byteLength: number;
    }): WebGl2FrameVertexBuffer | undefined {
        lifecycle.assertNotDisposed();
        if (!assertRunning("getWebGl2FrameVertexBuffer")) return undefined;

        let record = frameVertexBuffers.get(args.layout);
        if (!record) {
            record = {
                desc: {
                    label: `render.2d.${args.layout}.frameVertices`,
                    size: normalizePositiveInteger(
                        args.byteLength,
                        "buffer size",
                    ),
                    kind: "vertex",
                },
                invalidated: contextState !== "ok",
                native: {},
            };
            frameVertexBuffers.set(args.layout, record);
        }

        const currentCapacity = record.native.webgl2?.capacityBytes ?? 0;
        if (
            record.native.webgl2?.buffer &&
            currentCapacity >= args.byteLength
        ) {
            lastWebGl2Context = args.gl;
            return {
                buffer: record.native.webgl2.buffer,
                capacityBytes: currentCapacity,
                status: "reused",
            };
        }

        deleteWebGl2Buffer(record, args.gl);
        const status = currentCapacity > 0 ? "grown" : "created";
        let nextCapacity = Math.max(256, currentCapacity || record.desc.size);

        while (nextCapacity < args.byteLength) nextCapacity *= 2;
        const buffer = createWebGl2Buffer(args.gl);

        if (!buffer) return undefined;
        args.gl.bindBuffer(args.gl.ARRAY_BUFFER, buffer);
        args.gl.bufferData(
            args.gl.ARRAY_BUFFER,
            nextCapacity,
            args.gl.STREAM_DRAW,
        );
        args.gl.bindBuffer(args.gl.ARRAY_BUFFER, null);

        record.desc = { ...record.desc, size: nextCapacity };
        record.native.webgl2 = { buffer, capacityBytes: nextCapacity };
        record.invalidated = false;

        lastWebGl2Context = args.gl;

        return { buffer, capacityBytes: nextCapacity, status };
    }

    function getWebGpuFrameVertexBuffer(args: {
        layout: GpuFrameVertexLayoutKey;
        device: WebGpuDeviceLike;
        byteLength: number;
    }): WebGpuFrameVertexBuffer | undefined {
        lifecycle.assertNotDisposed();
        if (!assertRunning("getWebGpuFrameVertexBuffer")) return undefined;
        let record = frameVertexBuffers.get(args.layout);
        if (!record) {
            record = {
                desc: {
                    label: `render.2d.${args.layout}.frameVertices`,
                    size: normalizePositiveInteger(
                        args.byteLength,
                        "buffer size",
                    ),
                    kind: "vertex",
                },
                invalidated: contextState !== "ok",
                native: {},
            };
            frameVertexBuffers.set(args.layout, record);
        }

        const currentCapacity = record.native.webgpu?.capacityBytes ?? 0;
        if (
            record.native.webgpu?.buffer &&
            currentCapacity >= args.byteLength
        ) {
            return {
                buffer: record.native.webgpu.buffer,
                capacityBytes: currentCapacity,
                status: "reused",
            };
        }

        deleteWebGpuBuffer(record);
        const status = currentCapacity > 0 ? "grown" : "created";
        let nextCapacity = Math.max(256, currentCapacity || record.desc.size);
        while (nextCapacity < args.byteLength) nextCapacity *= 2;
        const buffer = createWebGpuBuffer(
            args.device,
            record.desc.label,
            nextCapacity,
        );
        if (!buffer) return undefined;
        record.desc = { ...record.desc, size: nextCapacity };
        record.native.webgpu = { buffer, capacityBytes: nextCapacity };
        record.invalidated = false;

        return { buffer, capacityBytes: nextCapacity, status };
    }

    function getWebGl2UnitQuadGeometry(
        gl: WebGL2RenderingContext,
    ): WebGl2UnitQuadGeometry | undefined {
        lifecycle.assertNotDisposed();
        if (!assertRunning("getWebGl2UnitQuadGeometry")) return undefined;
        lastWebGl2Context = gl;
        if (unitQuadGeometry.webgl2) return unitQuadGeometry.webgl2;

        const vertexBuffer = createWebGl2Buffer(gl);
        const indexBuffer = createWebGl2Buffer(gl);
        if (!vertexBuffer || !indexBuffer) return undefined;

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            RENDER_2D_UNIT_QUAD_VERTEX_DATA,
            gl.STATIC_DRAW,
        );
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, UNIT_QUAD_INDEX_DATA, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        unitQuadGeometry.webgl2 = {
            vertexBuffer,
            indexBuffer,
            vertexCount: 6,
        };
        return unitQuadGeometry.webgl2;
    }

    function createStaticWebGpuBuffer(args: {
        device: WebGpuDeviceLike;
        label: string;
        byteLength: number;
        usage: number;
        data: ArrayBufferView;
    }): WebGpuUnitQuadGeometry["vertexBuffer"] | undefined {
        try {
            const buffer = args.device.createBuffer({
                label: args.label,
                size: normalizePositiveInteger(
                    args.byteLength,
                    "WebGPU buffer size",
                ),
                usage: args.usage,
            });
            args.device.queue.writeBuffer(buffer, 0, args.data);
            return buffer;
        } catch (error) {
            if (debug) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "unknown buffer error";
                throw new Error(
                    `GpuResourceService: failed to create WebGPU static buffer - ${message}`,
                );
            }
            return undefined;
        }
    }

    function getWebGpuUnitQuadGeometry(
        device: WebGpuDeviceLike,
    ): WebGpuUnitQuadGeometry | undefined {
        lifecycle.assertNotDisposed();
        if (!assertRunning("getWebGpuUnitQuadGeometry")) return undefined;
        if (unitQuadGeometry.webgpu) return unitQuadGeometry.webgpu;

        const vertexBuffer = createStaticWebGpuBuffer({
            device,
            label: "render.2d.unitQuad.vertices",
            byteLength: RENDER_2D_UNIT_QUAD_VERTEX_DATA.byteLength,
            usage: WEBGPU_BUFFER_USAGE_VERTEX_COPY_DST,
            data: RENDER_2D_UNIT_QUAD_VERTEX_DATA,
        });
        const indexBuffer = createStaticWebGpuBuffer({
            device,
            label: "render.2d.unitQuad.indices",
            byteLength: UNIT_QUAD_INDEX_DATA.byteLength,
            usage: WEBGPU_BUFFER_USAGE_INDEX_COPY_DST,
            data: UNIT_QUAD_INDEX_DATA,
        });
        if (!vertexBuffer || !indexBuffer) return undefined;

        unitQuadGeometry.webgpu = {
            vertexBuffer,
            indexBuffer,
            vertexCount: 6,
        };
        return unitQuadGeometry.webgpu;
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

    function getWebGpuSampler(
        handle: GpuSamplerHandle | undefined,
        device: WebGpuDeviceLike,
    ) {
        if (!handle) return undefined;
        const record = samplers.get(handle);
        if (!record) return undefined;
        if (record.native.webgpu?.sampler) return record.native.webgpu.sampler;
        try {
            const sampler = device.createSampler({
                label: record.desc.label,
                minFilter: record.desc.minFilter ?? "linear",
                magFilter: record.desc.magFilter ?? "linear",
                addressModeU: record.desc.addressModeU ?? "clamp-to-edge",
                addressModeV: record.desc.addressModeV ?? "clamp-to-edge",
            });
            record.native.webgpu = { sampler };
            record.invalidated = false;
            return sampler;
        } catch (error) {
            if (debug) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "unknown sampler error";
                throw new Error(
                    `GpuResourceService: failed to create WebGPU sampler - ${message}`,
                );
            }
            return undefined;
        }
    }

    function uploadWebGl2Texture(
        gl: WebGL2RenderingContext,
        handle: GpuTextureHandle,
        upload: RetainedTextureUpload,
    ): void {
        const record = textures.get(handle);
        const texture =
            record?.native.webgl2?.texture ?? getWebGl2Texture(handle, gl);
        if (!record || !texture) return;
        const sampler = record.sampler
            ? samplers.get(record.sampler)
            : undefined;
        uploadWebGl2NativeTexture(gl, texture, sampler?.desc, upload);
        record.invalidated = false;
    }

    function textureFormatToWebGpu(format: GpuTextureFormat): string {
        switch (format) {
            case "rgba8":
                return "rgba8unorm";
        }
    }

    function uploadWebGpuTexture(
        device: WebGpuDeviceLike,
        handle: GpuTextureHandle,
        upload: RetainedTextureUpload,
    ): void {
        const record = textures.get(handle);
        const texture =
            record?.native.webgpu?.texture ?? getWebGpuTexture(handle, device);
        if (!record || !texture) return;

        device.queue.writeTexture(
            { texture },
            upload.data,
            {
                bytesPerRow: upload.width * 4,
                rowsPerImage: upload.height,
            },
            {
                width: upload.width,
                height: upload.height,
                depthOrArrayLayers: 1,
            },
        );
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

    function getWebGpuTexture(
        handle: GpuTextureHandle,
        device: WebGpuDeviceLike,
    ) {
        lifecycle.assertNotDisposed();
        if (!assertRunning("getWebGpuTexture")) return undefined;
        const record = textures.get(handle);
        if (!record) return undefined;
        if (!record.native.webgpu?.texture) {
            try {
                const texture = device.createTexture({
                    label: record.desc.label,
                    size: {
                        width: record.desc.width,
                        height: record.desc.height,
                        depthOrArrayLayers: 1,
                    },
                    format: textureFormatToWebGpu(record.desc.format),
                    usage: WEBGPU_TEXTURE_USAGE_TEXTURE_BINDING_COPY_DST,
                });
                record.native.webgpu = {
                    ...record.native.webgpu,
                    texture,
                    view: texture.createView(),
                    bindGroup: undefined,
                };
                record.invalidated = true;
            } catch (error) {
                if (debug) {
                    const message =
                        error instanceof Error
                            ? error.message
                            : "unknown texture error";
                    throw new Error(
                        `GpuResourceService: failed to create WebGPU texture - ${message}`,
                    );
                }
                return undefined;
            }
        }
        if (record.retainedUpload && record.invalidated) {
            uploadWebGpuTexture(device, handle, record.retainedUpload);
        }
        return record.native.webgpu.texture;
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
            resourceId === undefined
                ? undefined
                : textureResources.get(resourceId);
        const resolvedHandle =
            handle ?? fallbackTexture ?? createFallbackTexture();
        const texture = getWebGl2Texture(resolvedHandle, gl);
        const record = textures.get(resolvedHandle);
        if (!texture || !record) return undefined;
        return {
            texture,
            sampler: getWebGl2Sampler(record.sampler, gl),
            fallback: handle === undefined,
        };
    }

    function resolveWebGpuTexture(args: {
        resourceId: string | undefined;
        device: WebGpuDeviceLike;
        bindGroupLayout?: object;
    }): WebGpuTextureBinding | undefined {
        lifecycle.assertNotDisposed();
        if (!assertRunning("resolveWebGpuTexture")) return undefined;
        const handle =
            args.resourceId === undefined
                ? undefined
                : textureResources.get(args.resourceId);
        const resolvedHandle =
            handle ?? fallbackTexture ?? createFallbackTexture();
        const texture = getWebGpuTexture(resolvedHandle, args.device);
        const record = textures.get(resolvedHandle);
        const view = record?.native.webgpu?.view;
        const sampler = getWebGpuSampler(record?.sampler, args.device);
        if (!texture || !record || !view || !sampler) return undefined;

        let bindGroup: WebGpuBindGroupLike | undefined =
            record.native.webgpu?.bindGroup;
        if (args.bindGroupLayout && !bindGroup) {
            try {
                bindGroup = args.device.createBindGroup({
                    label: record.desc.label
                        ? `${record.desc.label}.bindGroup`
                        : undefined,
                    layout: args.bindGroupLayout,
                    entries: [
                        { binding: 0, resource: view },
                        { binding: 1, resource: sampler },
                    ],
                });
                record.native.webgpu = { ...record.native.webgpu, bindGroup };
            } catch (error) {
                if (debug) {
                    const message =
                        error instanceof Error
                            ? error.message
                            : "unknown bind group error";
                    throw new Error(
                        `GpuResourceService: failed to create WebGPU bind group - ${message}`,
                    );
                }
                return undefined;
            }
        }

        return {
            texture,
            view,
            sampler,
            bindGroup,
            fallback: handle === undefined,
        };
    }

    function flushWebGl2Uploads(gl: WebGL2RenderingContext): void {
        lifecycle.assertNotDisposed();
        if (
            !assertRunning("flushWebGl2Uploads") ||
            pendingUploads.length === 0
        ) {
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
            gl.bufferData(
                target,
                upload.data,
                uploadUsageToWebGlUsage(gl, upload.usage),
            );
            record.invalidated = false;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    function flushWebGpuUploads(device: WebGpuDeviceLike): void {
        lifecycle.assertNotDisposed();
        if (
            !assertRunning("flushWebGpuUploads") ||
            pendingUploads.length === 0
        ) {
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
                uploadWebGpuTexture(device, upload.target, {
                    width: upload.width ?? record.desc.width,
                    height: upload.height ?? record.desc.height,
                    format: upload.format ?? record.desc.format,
                    data: upload.data,
                });
                continue;
            }

            const record = buffers.get(upload.target);
            const buffer = record?.native.webgpu?.buffer;
            if (!record || !buffer) continue;
            device.queue.writeBuffer(buffer, 0, upload.data);
            record.invalidated = false;
        }
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
            deleteWebGpuTexture(record);
            if (record?.sampler) release(record.sampler);
            return textures.delete(textureHandle);
        }
        if (handle.startsWith("gpu-buffer:")) {
            const bufferHandle = handle as GpuBufferHandle;
            transientBuffers.delete(bufferHandle);
            deleteWebGl2Buffer(buffers.get(bufferHandle));
            deleteWebGpuBuffer(buffers.get(bufferHandle));
            return buffers.delete(bufferHandle);
        }
        if (handle.startsWith("gpu-sampler:")) {
            const samplerHandle = handle as GpuSamplerHandle;
            deleteWebGl2Sampler(samplers.get(samplerHandle));
            const record = samplers.get(samplerHandle);
            if (record?.native.webgpu) record.native.webgpu.sampler = undefined;
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
        flushWebGpuUploads,
        getWebGl2Buffer,
        getWebGpuFrameVertexBuffer,
        getWebGl2FrameVertexBuffer,
        getWebGl2UnitQuadGeometry,
        getWebGpuUnitQuadGeometry,
        resolveWebGl2Texture,
        resolveWebGpuTexture,
        release,
        dispose: lifecycle.dispose,
    });
}

export function createGpuResource(
    config: GpuResourceConfig = {},
): GpuResourceService {
    return createGpuResourceService(config);
}
