import { createLifecycle } from "../../../controllers/Lifecycle.controller";
import { createGfx } from "../gfxBackend";
import { createGpuResource } from "../gpuResource";
import { createRenderFrameBuilder } from "../modules/FrameBuilder.module";
import { createRender2DPrepare } from "../modules/Render2DPrepare.module";
import type { Render2DPreparedFrame } from "../modules/Render2DPrepare.module";
import { createSubmitFrame } from "../modules/SubmitFrame.module";
import { createPipelineLibrary } from "../pipelineLibrary";
import { createRenderView } from "./Render.view";
import type {
    RenderConfig,
    RenderFrameInput,
    RenderSnapshot,
    RenderSubmitResult,
    RenderTextureResourceConfig,
    RenderView,
} from "./Render.types";

export type RenderService = Readonly<{
    view: RenderView;
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    register: {
        textures(textures: readonly RenderTextureResourceConfig[]): void;
    };
    prepare(input: RenderFrameInput): void;
    execute(): RenderSubmitResult;
    dispose(): Promise<boolean>;
}>;

function createDefaultStats(textureResourceCount = 0) {
    return {
        passCount: 0,
        commandCount: 0,
        batchCount: 0,
        drawCallCount: 0,
        vertexCount: 0,
        skippedResourceCount: 0,
        fallbackResourceCount: 0,
        textureResourceCount,
    };
}

function createRenderService(config: RenderConfig): RenderService {
    if (!config.canvas) {
        throw new Error("RenderService.create: canvas is required");
    }

    const debug = config.debug ?? false;
    const textureResources = new Map<string, RenderTextureResourceConfig>();
    const gfx = createGfx({ canvas: config.canvas, debug });
    const gpuResource = createGpuResource({ debug });
    const pipelineLibrary = createPipelineLibrary({ debug });
    const frameBuilder = createRenderFrameBuilder();
    const render2DPrepare = createRender2DPrepare({ debug });
    const submitFrame = createSubmitFrame({
        getRuntime: gfx.getRuntime,
        gpuResource,
        pipelineLibrary,
    });
    let preparedFrame: Render2DPreparedFrame | undefined;
    const snapshot: RenderSnapshot = {
        backend: "none",
        gfxState: "unavailable",
        frameSeq: 0,
        target: { w: 0, h: 0, dpr: 1 },
        lastSubmitResult: { status: "no-frame" },
        stats: createDefaultStats(),
    };

    const lifecycle = createLifecycle({
        tag: "RenderService",
        debug,
        onStart: async () => {
            await gfx.start();
            await gpuResource.start();
            await pipelineLibrary.start();
            registerTextureResources(config.resources?.textures ?? [], true);
            syncBackendState();
        },
        onStop: async () => {
            preparedFrame = undefined;
            snapshot.lastSubmitResult = { status: "no-frame" };
            snapshot.stats = frameBuilder.clear();
            snapshot.stats = {
                ...snapshot.stats,
                textureResourceCount: textureResources.size,
            };
            await pipelineLibrary.stop();
            await gpuResource.stop();
            await gfx.stop();
            snapshot.backend = "none";
            snapshot.gfxState = "unavailable";
        },
        onDispose: async () => {
            textureResources.clear();
            preparedFrame = undefined;
            snapshot.stats = createDefaultStats();
            await pipelineLibrary.dispose();
            await gpuResource.dispose();
            await gfx.dispose();
            snapshot.backend = "none";
            snapshot.gfxState = "unavailable";
        },
    });

    function assertRunning(method: "prepare" | "execute"): boolean {
        if (lifecycle.isRunning()) return true;
        if (debug) {
            throw new Error(`RenderService.${method}: service is not running`);
        }
        return false;
    }

    function registerTextureResources(
        textures: readonly RenderTextureResourceConfig[],
        registerGpu = lifecycle.isRunning(),
    ): void {
        for (const texture of textures) {
            textureResources.set(texture.id, texture);
            if (registerGpu) {
                gpuResource.registerTextureResource(texture);
            }
        }
        snapshot.stats = {
            ...snapshot.stats,
            textureResourceCount: textureResources.size,
        };
    }

    function textures(textures: readonly RenderTextureResourceConfig[]): void {
        lifecycle.assertNotDisposed();
        registerTextureResources(textures);
    }

    function syncBackendState(): void {
        gfx.latch();
        snapshot.backend = gfx.view.backend;
        snapshot.gfxState = gfx.view.state;

        const gfxStatus = gfx.view.state === "ok" ? "ok" : "lost";
        gpuResource.sync({ gfxStatus });
        if (gfx.view.backend === "webgl2") {
            pipelineLibrary.sync({
                gfxBackend: "webgl2",
                gfxStatus,
            });
        }
    }

    function prepare(input: RenderFrameInput): void {
        lifecycle.assertNotDisposed();
        if (!assertRunning("prepare")) return;

        preparedFrame = render2DPrepare.prepare(input);
        snapshot.frameSeq++;
        snapshot.target = input.target;
        snapshot.lastSubmitResult = { status: "no-frame" };
        snapshot.stats = {
            ...frameBuilder.begin(input.target),
            ...preparedFrame.stats,
            textureResourceCount: textureResources.size,
        };
    }

    function execute(): RenderSubmitResult {
        lifecycle.assertNotDisposed();
        if (!assertRunning("execute")) {
            const result: RenderSubmitResult = {
                status: "skipped",
                reason: "not-running",
            };
            snapshot.lastSubmitResult = result;
            return result;
        }

        syncBackendState();
        if (!preparedFrame) {
            const report = submitFrame.submit(undefined);
            snapshot.lastSubmitResult = report.result;
            snapshot.stats = {
                ...snapshot.stats,
                ...report.metrics,
                textureResourceCount: textureResources.size,
            };
            return report.result;
        }

        if (snapshot.gfxState === "lost") {
            const result: RenderSubmitResult = {
                status: "skipped",
                reason: "gfx-lost",
            };
            snapshot.lastSubmitResult = result;
            preparedFrame = undefined;
            return result;
        }

        const report = submitFrame.submit(preparedFrame);
        const result = report.result;
        snapshot.lastSubmitResult = result;
        snapshot.stats = {
            ...snapshot.stats,
            ...report.metrics,
            textureResourceCount: textureResources.size,
        };
        preparedFrame = undefined;

        return result;
    }

    return Object.freeze({
        view: createRenderView(() => snapshot),
        start: lifecycle.start,
        stop: lifecycle.stop,
        register: Object.freeze({
            textures,
        }),
        prepare,
        execute,
        dispose: lifecycle.dispose,
    });
}

export function createRender(config: RenderConfig): RenderService {
    return createRenderService(config);
}
