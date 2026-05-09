import { createLifecycle } from "../../../controllers/Lifecycle.controller";
import { createRenderFrameBuilder } from "../modules/FrameBuilder.module";
import { createRender2DPrepare } from "../modules/Render2DPrepare.module";
import { createSubmitFrame } from "../modules/SubmitFrame.module";
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
    const frameBuilder = createRenderFrameBuilder();
    const render2DPrepare = createRender2DPrepare();
    const submitFrame = createSubmitFrame();
    let hasPreparedFrame = false;
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
        onStart: () => {
            registerTextureResources(config.resources?.textures ?? []);
        },
        onStop: () => {
            hasPreparedFrame = false;
            snapshot.lastSubmitResult = { status: "no-frame" };
            snapshot.stats = frameBuilder.clear();
            snapshot.stats = {
                ...snapshot.stats,
                textureResourceCount: textureResources.size,
            };
        },
        onDispose: () => {
            textureResources.clear();
            hasPreparedFrame = false;
            snapshot.stats = createDefaultStats();
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
    ): void {
        for (const texture of textures) {
            textureResources.set(texture.id, texture);
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

    function prepare(input: RenderFrameInput): void {
        lifecycle.assertNotDisposed();
        if (!assertRunning("prepare")) return;

        render2DPrepare.prepare(input);
        hasPreparedFrame = true;
        snapshot.frameSeq++;
        snapshot.target = input.target;
        snapshot.lastSubmitResult = { status: "no-frame" };
        snapshot.stats = {
            ...frameBuilder.begin(input.target),
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

        const result = submitFrame.submit(hasPreparedFrame);
        snapshot.lastSubmitResult = result;
        hasPreparedFrame = false;

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
