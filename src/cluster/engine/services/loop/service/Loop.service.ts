import type { LoopConfig } from "./Loop.types";
import { createLifecycle } from "../../../controllers/Lifecycle.controller";

export type LoopService = {
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    dispose(): Promise<boolean>;
};

function createLoopService(config: LoopConfig): LoopService {
    const debug = config.debug ?? false;
    const fixedStepMs = config.fixedStepMs ?? 1000 / 60;
    const maxUpdatesPerFrame = config.maxUpdatesPerFrame ?? 5;

    const beginUpdate = config.onBeginUpdate;
    const fixedUpdate = config.onFixedUpdate;
    const preRender = config.onPreRender;
    const render = config.onRender;

    const requestFrame =
        config.platform?.requestFrame ??
        (typeof requestAnimationFrame !== "undefined"
            ? requestAnimationFrame
            : undefined);
    const cancelFrame =
        config.platform?.cancelFrame ??
        (typeof cancelAnimationFrame !== "undefined"
            ? cancelAnimationFrame
            : undefined);

    let updateSteps: number = 0;
    let lastFrameTimestamp: number = 0;
    let accumulatedTimeMs: number = 0;
    let frameRequestId: number | null = null;

    const assertRequestFrameNotUndefined = () => {
        if (!requestFrame) {
            if (debug) {
                throw new Error(
                    "LoopService: platform requestFrame is required"
                );
            }
            return;
        }
    };

    const assertCancelFrameNotUndefined = () => {
        if (!cancelFrame) {
            if (debug) {
                throw new Error(
                    "LoopService: platform cancelFrame is required"
                );
            }
            return;
        }
    };

    const handleDispose = () => {
        assertCancelFrameNotUndefined();

        if (frameRequestId !== null && cancelFrame) {
            cancelFrame(frameRequestId);
        }
        frameRequestId = null;
    };

    const handleStart = () => {
        assertRequestFrameNotUndefined();
        if (!requestFrame) return;

        updateSteps = 0;
        accumulatedTimeMs = 0;
        lastFrameTimestamp = 0;
        frameRequestId = requestFrame(loop);
    };

    const handleStop = () => {
        assertCancelFrameNotUndefined();

        if (frameRequestId !== null && cancelFrame) {
            cancelFrame(frameRequestId);
        }
        frameRequestId = null;
        lastFrameTimestamp = 0;
        accumulatedTimeMs = 0;
        updateSteps = 0;
    };

    const lifecycle = createLifecycle({
        tag: "LoopService",
        debug,
        onDispose: handleDispose,
        onStart: handleStart,
        onStop: handleStop,
    });

    function loop(frameTimestamp: number): void {
        if (!lifecycle.isRunning()) return;
        assertRequestFrameNotUndefined();
        if (!requestFrame) return;

        if (lastFrameTimestamp === 0) {
            lastFrameTimestamp = frameTimestamp;
        }

        const frameDeltaMs = Math.min(frameTimestamp - lastFrameTimestamp, 250);
        updateSteps = 0;
        lastFrameTimestamp = frameTimestamp;
        accumulatedTimeMs += frameDeltaMs;

        beginUpdate();

        while (
            accumulatedTimeMs >= fixedStepMs &&
            updateSteps < maxUpdatesPerFrame
        ) {
            fixedUpdate(fixedStepMs);
            accumulatedTimeMs -= fixedStepMs;
            updateSteps++;
        }

        if (updateSteps === maxUpdatesPerFrame) {
            accumulatedTimeMs = 0;
        }
        const alpha = accumulatedTimeMs / fixedStepMs;

        preRender(alpha);
        render(alpha);
        frameRequestId = requestFrame(loop);
    }

    return {
        dispose: lifecycle.dispose,
        start: lifecycle.start,
        stop: lifecycle.stop,
    };
}

export function createLoop(config: LoopConfig) {
    return createLoopService(config);
}
