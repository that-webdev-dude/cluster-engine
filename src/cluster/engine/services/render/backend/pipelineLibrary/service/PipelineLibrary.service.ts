import {
    createLifecycle,
    type LifecycleActivePhase,
    type LifecycleLivePhase,
} from "../../../../../controllers/Lifecycle.controller";
import type { GfxBackend } from "../../gfxBackend";
import { resolveWebGl2ShaderSource } from "../modules/WebGl2PipelineCompiler.module";
import {
    createWebGpuRenderPipelineDescriptor,
    resolveWebGpuShaderSource,
} from "../modules/WebGpuPipelineCompiler.module";
import type {
    PipelineDescriptor,
    PipelineHandle,
    PipelineLibraryConfig,
    PipelineLibraryKey,
    PipelineLibrarySyncArgs,
    PipelineRecordView,
    WebGl2Pipeline,
    WebGpuDeviceLike,
    WebGpuPipeline,
} from "./PipelineLibrary.types";

export type PipelineLibraryService = Readonly<{
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    sync(args: PipelineLibrarySyncArgs): void;
    getWebGl2Pipeline(args: {
        desc: PipelineDescriptor;
        gl: WebGL2RenderingContext;
    }): WebGl2Pipeline | undefined;
    getWebGpuPipeline(args: {
        desc: PipelineDescriptor;
        device: WebGpuDeviceLike;
        format: string;
    }): WebGpuPipeline | undefined;
    peekPipeline(key: PipelineLibraryKey): PipelineRecordView | undefined;
    release(handle: PipelineHandle): boolean;
    dispose(): Promise<boolean>;
}>;

type PipelineRecord = {
    key: PipelineLibraryKey;
    handle: PipelineHandle;
    backend: GfxBackend;
    desc: PipelineDescriptor;
    invalidated: boolean;
    compiled?:
        | {
              backend: "webgl2";
              program: WebGLProgram;
          }
        | {
              backend: "webgpu";
              pipeline: WebGpuPipeline["pipeline"];
          };
};

function createPipelineLibraryService(
    config: PipelineLibraryConfig,
): PipelineLibraryService {
    const debug = config.debug ?? false;
    let currentBackend: GfxBackend = "webgl2";
    let currentStatus: PipelineLibrarySyncArgs["gfxStatus"] = "lost";
    let nextPipelineId = 0;
    let lastWebGl2Context: WebGL2RenderingContext | undefined;
    const pipelinesByKey = new Map<PipelineLibraryKey, PipelineRecord>();
    const pipelineKeyByHandle = new Map<PipelineHandle, PipelineLibraryKey>();

    function createPipelineHandle(): PipelineHandle {
        return `pipeline:${++nextPipelineId}`;
    }

    function encodePipelineKeyPart(value: string): string {
        return encodeURIComponent(value);
    }

    function createPipelineKey(desc: PipelineDescriptor): PipelineLibraryKey {
        return [
            "render.pipeline",
            `pass=${encodePipelineKeyPart(desc.passKey)}`,
            `shader=${encodePipelineKeyPart(desc.shaderFamily)}`,
            `material=${encodePipelineKeyPart(desc.materialKey)}`,
            `primitive=${encodePipelineKeyPart(desc.primitive)}`,
            `blend=${encodePipelineKeyPart(desc.blend)}`,
            `layout=${encodePipelineKeyPart(desc.vertexLayoutKey)}`,
        ].join("|");
    }

    function assertRunning(methodName: string): boolean {
        if (lifecycle.isRunning()) return true;
        if (debug) {
            throw new Error(
                `PipelineLibraryService: invalid ${methodName} call - service is not running`,
            );
        }
        return false;
    }

    function normalizeDescriptor(desc: PipelineDescriptor): PipelineDescriptor {
        const materialKey = desc.materialKey.trim();
        if (!materialKey && debug) {
            throw new Error("PipelineLibraryService: material key is required");
        }
        return {
            shaderFamily: desc.shaderFamily,
            passKey: desc.passKey,
            materialKey: materialKey || "material:auto",
            primitive: desc.primitive,
            blend: desc.blend,
            vertexLayoutKey: desc.vertexLayoutKey,
        };
    }

    function destroyCompiledPipeline(
        record: PipelineRecord | undefined,
        gl = lastWebGl2Context,
    ): void {
        if (!record?.compiled) return;
        if (record.compiled.backend === "webgl2" && gl) {
            gl.deleteProgram(record.compiled.program);
        }
        record.compiled = undefined;
    }

    function markAllInvalidated(): void {
        for (const record of pipelinesByKey.values()) {
            record.invalidated = true;
            destroyCompiledPipeline(record);
        }
    }

    function clearPipelines(): void {
        for (const record of pipelinesByKey.values()) {
            destroyCompiledPipeline(record);
        }
        pipelinesByKey.clear();
        pipelineKeyByHandle.clear();
    }

    function compileWebGlShader(
        gl: WebGL2RenderingContext,
        type: number,
        source: string,
    ): WebGLShader | undefined {
        const shader = gl.createShader(type);
        if (!shader) {
            if (debug) {
                throw new Error("PipelineLibraryService: failed to create shader");
            }
            return undefined;
        }

        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader;
        }

        const info = gl.getShaderInfoLog(shader) ?? "unknown shader compile error";
        gl.deleteShader(shader);
        if (debug) {
            throw new Error(`PipelineLibraryService: shader compile failed - ${info}`);
        }
        return undefined;
    }

    function compileWebGl2Program(
        gl: WebGL2RenderingContext,
        desc: PipelineDescriptor,
    ): WebGLProgram | undefined {
        const shaderSource = resolveWebGl2ShaderSource(desc);
        if (!shaderSource) {
            if (debug) {
                throw new Error(
                    `PipelineLibraryService: unsupported WebGL2 pipeline descriptor - shaderFamily=${desc.shaderFamily}, vertexLayoutKey=${desc.vertexLayoutKey}`,
                );
            }
            return undefined;
        }

        const vertexShader = compileWebGlShader(
            gl,
            gl.VERTEX_SHADER,
            shaderSource.vertex,
        );
        const fragmentShader = compileWebGlShader(
            gl,
            gl.FRAGMENT_SHADER,
            shaderSource.fragment,
        );
        if (!vertexShader || !fragmentShader) {
            if (vertexShader) gl.deleteShader(vertexShader);
            if (fragmentShader) gl.deleteShader(fragmentShader);
            return undefined;
        }

        const program = gl.createProgram();
        if (!program) {
            gl.deleteShader(vertexShader);
            gl.deleteShader(fragmentShader);
            if (debug) {
                throw new Error("PipelineLibraryService: failed to create program");
            }
            return undefined;
        }

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.detachShader(program, vertexShader);
        gl.detachShader(program, fragmentShader);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            return program;
        }

        const info = gl.getProgramInfoLog(program) ?? "unknown program link error";
        gl.deleteProgram(program);
        if (debug) {
            throw new Error(`PipelineLibraryService: program link failed - ${info}`);
        }
        return undefined;
    }

    const lifecycle = createLifecycle({
        tag: "PipelineLibraryService",
        debug,
        onStart: () => {
            currentStatus = "ok";
            for (const record of pipelinesByKey.values()) {
                record.invalidated = false;
            }
        },
        onStop: (_from: LifecycleActivePhase) => {
            currentStatus = "lost";
            markAllInvalidated();
        },
        onDispose: (_from: LifecycleLivePhase) => {
            currentStatus = "lost";
            clearPipelines();
        },
    });

    function sync(args: PipelineLibrarySyncArgs): void {
        lifecycle.assertNotDisposed();
        if (!assertRunning("sync")) return;
        const backendChanged = args.gfxBackend !== currentBackend;
        currentBackend = args.gfxBackend;
        if (args.gfxStatus === currentStatus && !backendChanged) return;
        currentStatus = args.gfxStatus;
        if (currentStatus === "lost") {
            markAllInvalidated();
            return;
        }
        if (backendChanged) {
            clearPipelines();
            return;
        }
        for (const record of pipelinesByKey.values()) {
            record.invalidated = false;
        }
    }

    function getWebGl2Pipeline(args: {
        desc: PipelineDescriptor;
        gl: WebGL2RenderingContext;
    }): WebGl2Pipeline | undefined {
        lifecycle.assertNotDisposed();
        if (!assertRunning("getWebGl2Pipeline")) return undefined;
        lastWebGl2Context = args.gl;
        const normalized = normalizeDescriptor(args.desc);
        const key = createPipelineKey(normalized);
        const existing = pipelinesByKey.get(key);
        const record =
            existing ??
            ({
                key,
                handle: createPipelineHandle(),
                backend: currentBackend,
                desc: normalized,
                invalidated: currentStatus !== "ok",
            } satisfies PipelineRecord);

        if (!existing) {
            pipelinesByKey.set(key, record);
            pipelineKeyByHandle.set(record.handle, key);
        }

        if (
            !record.compiled ||
            record.compiled.backend !== "webgl2" ||
            record.invalidated
        ) {
            destroyCompiledPipeline(record, args.gl);
            const program = compileWebGl2Program(args.gl, normalized);
            if (!program) return undefined;
            record.backend = "webgl2";
            record.desc = normalized;
            record.invalidated = false;
            record.compiled = { backend: "webgl2", program };
        }

        return {
            handle: record.handle,
            program: record.compiled.program,
        };
    }

    function compileWebGpuPipeline(args: {
        desc: PipelineDescriptor;
        device: WebGpuDeviceLike;
        format: string;
    }): WebGpuPipeline["pipeline"] | undefined {
        const shaderSource = resolveWebGpuShaderSource(args.desc);
        if (!shaderSource) {
            if (debug) {
                throw new Error(
                    `PipelineLibraryService: unsupported WebGPU pipeline descriptor - shaderFamily=${args.desc.shaderFamily}, vertexLayoutKey=${args.desc.vertexLayoutKey}`,
                );
            }
            return undefined;
        }

        try {
            const vertexModule = args.device.createShaderModule({
                label: `render.${args.desc.shaderFamily}.vertex`,
                code: shaderSource.vertex,
            });
            const fragmentModule = args.device.createShaderModule({
                label: `render.${args.desc.shaderFamily}.fragment`,
                code: shaderSource.fragment,
            });
            return args.device.createRenderPipeline(
                createWebGpuRenderPipelineDescriptor({
                    desc: args.desc,
                    format: args.format,
                    vertexModule,
                    fragmentModule,
                    shaderSource,
                }),
            );
        } catch (error) {
            if (debug) {
                const message =
                    error instanceof Error ? error.message : "unknown pipeline error";
                throw new Error(
                    `PipelineLibraryService: WebGPU pipeline creation failed - ${message}`,
                );
            }
            return undefined;
        }
    }

    function getWebGpuPipeline(args: {
        desc: PipelineDescriptor;
        device: WebGpuDeviceLike;
        format: string;
    }): WebGpuPipeline | undefined {
        lifecycle.assertNotDisposed();
        if (!assertRunning("getWebGpuPipeline")) return undefined;
        const normalized = normalizeDescriptor(args.desc);
        const key = createPipelineKey(normalized);
        const existing = pipelinesByKey.get(key);
        const record =
            existing ??
            ({
                key,
                handle: createPipelineHandle(),
                backend: currentBackend,
                desc: normalized,
                invalidated: currentStatus !== "ok",
            } satisfies PipelineRecord);

        if (!existing) {
            pipelinesByKey.set(key, record);
            pipelineKeyByHandle.set(record.handle, key);
        }

        if (
            !record.compiled ||
            record.compiled.backend !== "webgpu" ||
            record.invalidated ||
            record.backend !== "webgpu"
        ) {
            destroyCompiledPipeline(record);
            const pipeline = compileWebGpuPipeline({
                desc: normalized,
                device: args.device,
                format: args.format,
            });
            if (!pipeline) return undefined;
            record.backend = "webgpu";
            record.desc = normalized;
            record.invalidated = false;
            record.compiled = { backend: "webgpu", pipeline };
        }

        return {
            handle: record.handle,
            pipeline: record.compiled.pipeline,
        };
    }

    function peekPipeline(
        key: PipelineLibraryKey,
    ): PipelineRecordView | undefined {
        lifecycle.assertNotDisposed();
        const record = pipelinesByKey.get(key);
        if (!record) return undefined;
        return {
            key: record.key,
            handle: record.handle,
            backend: record.backend,
            invalidated: record.invalidated,
        };
    }

    function release(handle: PipelineHandle): boolean {
        lifecycle.assertNotDisposed();
        const key = pipelineKeyByHandle.get(handle);
        if (!key) return false;
        pipelineKeyByHandle.delete(handle);
        const record = pipelinesByKey.get(key);
        destroyCompiledPipeline(record);
        return pipelinesByKey.delete(key);
    }

    return Object.freeze({
        start: lifecycle.start,
        stop: lifecycle.stop,
        sync,
        getWebGl2Pipeline,
        getWebGpuPipeline,
        peekPipeline,
        release,
        dispose: lifecycle.dispose,
    });
}

export function createPipelineLibrary(
    config: PipelineLibraryConfig = {},
): PipelineLibraryService {
    return createPipelineLibraryService(config);
}
