import { createLifecycle } from "../../../controllers/Lifecycle.controller";
import { createGfx } from "../backend/gfxBackend";
import { createGpuResource } from "../backend/gpuResource";
import { createRenderFrameBuilder } from "../modules/FrameBuilder.module";
import { createFontRegistry } from "../modules/FontRegistry.module";
import { createRender2DPrepare } from "../modules/Render2DPrepare.module";
import type { Render2DPreparedFrame } from "../modules/Render2DPrepare.module";
import { createSubmitFrame } from "../modules/SubmitFrame.module";
import { createTextLayout } from "../modules/TextLayout.module";
import { createPipelineLibrary } from "../backend/pipelineLibrary";
import { createRenderView } from "./Render.view";
import type {
    RenderConfig,
    RenderFrameInput,
    RenderFrameStats,
    RenderSnapshot,
    RenderSubmitResult,
    RenderBitmapFontConfig,
    RenderTextureResourceConfig,
    RenderView,
} from "./Render.types";

export type RenderService = Readonly<{
    view: RenderView;
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    register: {
        textures(textures: readonly RenderTextureResourceConfig[]): void;
        fonts(fonts: readonly RenderBitmapFontConfig[]): void;
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
        uploadCallCount: 0,
        uploadByteCount: 0,
        uploadRangeCount: 0,
        uploadLayoutCount: 0,
        frameVertexBufferCreateCount: 0,
        frameVertexBufferGrowCount: 0,
        frameVertexBufferReuseCount: 0,
        frameVertexBufferCapacityBytes: 0,
        skippedResourceCount: 0,
        fallbackResourceCount: 0,
        textureResourceCount,
        fontResourceCount: 0,
        fontPageResourceCount: 0,
        fontReplacementRegistrationCount: 0,
        invalidFontRegistrationCount: 0,
        missingFontCount: 0,
        missingGlyphCount: 0,
        textItemCount: 0,
        preparedGlyphCount: 0,
        glyphVertexCount: 0,
        textBatchCount: 0,
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
    const fontRegistry = createFontRegistry({ debug });
    const textLayout = createTextLayout();
    const render2DPrepare = createRender2DPrepare({
        debug,
        fontRegistry,
        textLayout,
    });
    const submitFrame = createSubmitFrame({
        getRuntime: gfx.getRuntime,
        gpuResource,
        pipelineLibrary,
    });
    let preparedFrame: Render2DPreparedFrame | undefined;
    let hasPreparedTarget = false;
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
            registerFontResources(config.resources?.fonts ?? []);
            syncBackendState();
        },
        onStop: async () => {
            preparedFrame = undefined;
            hasPreparedTarget = false;
            snapshot.lastSubmitResult = { status: "no-frame" };
            snapshot.stats = frameBuilder.clear();
            snapshot.stats = withResourceStats(snapshot.stats);
            await pipelineLibrary.stop();
            await gpuResource.stop();
            await gfx.stop();
            snapshot.backend = "none";
            snapshot.gfxState = "unavailable";
        },
        onDispose: async () => {
            textureResources.clear();
            fontRegistry.clear();
            textLayout.clearCache();
            preparedFrame = undefined;
            hasPreparedTarget = false;
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
            ...withResourceStats(snapshot.stats),
        };
    }

    function registerFontResources(
        fonts: readonly RenderBitmapFontConfig[],
    ): void {
        fontRegistry.register(fonts);
        snapshot.stats = {
            ...snapshot.stats,
            ...withResourceStats(snapshot.stats),
        };
    }

    function withResourceStats(stats: RenderFrameStats): RenderFrameStats {
        const fontStats = fontRegistry.getStats();
        return {
            ...stats,
            textureResourceCount: textureResources.size,
            fontResourceCount: fontStats.fontResourceCount,
            fontPageResourceCount: fontStats.fontPageResourceCount,
            fontReplacementRegistrationCount:
                fontStats.fontReplacementRegistrationCount,
            invalidFontRegistrationCount: fontStats.invalidFontRegistrationCount,
            missingFontCount: stats.missingFontCount + fontStats.missingFontCount,
            missingGlyphCount:
                stats.missingGlyphCount + fontStats.missingGlyphCount,
        };
    }

    function textures(textures: readonly RenderTextureResourceConfig[]): void {
        lifecycle.assertNotDisposed();
        registerTextureResources(textures);
    }

    function fonts(fonts: readonly RenderBitmapFontConfig[]): void {
        lifecycle.assertNotDisposed();
        registerFontResources(fonts);
    }

    function syncBackendState(): void {
        gfx.latch();
        snapshot.backend = gfx.view.backend;
        snapshot.gfxState = gfx.view.state;

        const gfxStatus = gfx.view.state === "ok" ? "ok" : "lost";
        gpuResource.sync({ gfxStatus });
        if (gfx.view.backend === "webgl2" || gfx.view.backend === "webgpu") {
            pipelineLibrary.sync({
                gfxBackend: gfx.view.backend,
                gfxStatus,
            });
        }
    }

    function recoverBackendIfLost(): void {
        if (gfx.view.state !== "lost") return;
        if (!gfx.recoverIfLost()) return;
        syncBackendState();
    }

    function prepare(input: RenderFrameInput): void {
        lifecycle.assertNotDisposed();
        if (!assertRunning("prepare")) return;

        preparedFrame = render2DPrepare.prepare(input);
        hasPreparedTarget = true;
        snapshot.frameSeq++;
        snapshot.target = input.target;
        snapshot.lastSubmitResult = { status: "no-frame" };
        snapshot.stats = withResourceStats({
            ...frameBuilder.begin(input.target),
            ...preparedFrame.stats,
        });
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
        recoverBackendIfLost();
        if (hasPreparedTarget) {
            gfx.configureSurface(snapshot.target);
        }
        if (!preparedFrame) {
            const report = submitFrame.submit(undefined);
            snapshot.lastSubmitResult = report.result;
            snapshot.stats = withResourceStats({
                ...snapshot.stats,
                ...report.metrics,
            });
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
        snapshot.stats = withResourceStats({
            ...snapshot.stats,
            ...report.metrics,
        });
        preparedFrame = undefined;

        return result;
    }

    return Object.freeze({
        view: createRenderView(() => snapshot),
        start: lifecycle.start,
        stop: lifecycle.stop,
        register: Object.freeze({
            textures,
            fonts,
        }),
        prepare,
        execute,
        dispose: lifecycle.dispose,
    });
}

export function createRender(config: RenderConfig): RenderService {
    return createRenderService(config);
}
