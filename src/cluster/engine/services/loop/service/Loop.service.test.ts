import { describe, expect, it } from "vitest";
import { createLoop } from "./Loop.service";
import type { LoopFrameRender, LoopFrameUpdate, LoopPlatform } from "./Loop.types";

type FrameCallback = (timestamp: number) => void;

function createFramePlatform() {
    let nextRequestId = 1;
    let pending: FrameCallback | undefined;

    const requested: number[] = [];
    const cancelled: number[] = [];

    const platform: LoopPlatform = {
        requestFrame(callback) {
            const requestId = nextRequestId++;
            pending = callback;
            requested.push(requestId);
            return requestId;
        },
        cancelFrame(requestId) {
            cancelled.push(requestId);
            pending = undefined;
        },
    };

    function fire(timestamp: number): void {
        const callback = pending;
        if (!callback) {
            throw new Error("createFramePlatform.fire: no pending frame");
        }
        pending = undefined;
        callback(timestamp);
    }

    return {
        platform,
        requested,
        cancelled,
        fire,
    };
}

describe("createLoop", () => {
    it("reports a zero-delta first frame", async () => {
        const framePlatform = createFramePlatform();
        const updates: LoopFrameUpdate[] = [];
        const renders: LoopFrameRender[] = [];
        const loop = createLoop({
            fixedStepMs: 10,
            platform: framePlatform.platform,
            onFrameUpdate(update) {
                updates.push(update);
            },
            onFrameRender(render) {
                renders.push(render);
            },
        });

        await loop.start();
        framePlatform.fire(100);

        expect(updates).toEqual([
            {
                frameDeltaMs: 0,
                rawFrameDeltaMs: 0,
                fixedStepMs: 10,
                updateSteps: 0,
                droppedUpdates: false,
            },
        ]);
        expect(renders).toEqual([
            {
                alpha: 0,
                frameDeltaMs: 0,
                rawFrameDeltaMs: 0,
            },
        ]);
    });

    it("accumulates fixed steps and reports interpolation alpha", async () => {
        const framePlatform = createFramePlatform();
        const updates: LoopFrameUpdate[] = [];
        const renders: LoopFrameRender[] = [];
        const loop = createLoop({
            fixedStepMs: 10,
            platform: framePlatform.platform,
            onFrameUpdate(update) {
                updates.push(update);
            },
            onFrameRender(render) {
                renders.push(render);
            },
        });

        await loop.start();
        framePlatform.fire(100);
        framePlatform.fire(125);

        expect(updates[1]).toEqual({
            frameDeltaMs: 25,
            rawFrameDeltaMs: 25,
            fixedStepMs: 10,
            updateSteps: 2,
            droppedUpdates: false,
        });
        expect(renders[1]).toEqual({
            alpha: 0.5,
            frameDeltaMs: 25,
            rawFrameDeltaMs: 25,
        });
    });

    it("caps large frame deltas before calculating update steps", async () => {
        const framePlatform = createFramePlatform();
        const updates: LoopFrameUpdate[] = [];
        const renders: LoopFrameRender[] = [];
        const loop = createLoop({
            fixedStepMs: 100,
            maxUpdatesPerFrame: 5,
            platform: framePlatform.platform,
            onFrameUpdate(update) {
                updates.push(update);
            },
            onFrameRender(render) {
                renders.push(render);
            },
        });

        await loop.start();
        framePlatform.fire(100);
        framePlatform.fire(500);

        expect(updates[1]).toEqual({
            frameDeltaMs: 250,
            rawFrameDeltaMs: 400,
            fixedStepMs: 100,
            updateSteps: 2,
            droppedUpdates: false,
        });
        expect(renders[1]).toEqual({
            alpha: 0.5,
            frameDeltaMs: 250,
            rawFrameDeltaMs: 400,
        });
    });

    it("reports dropped updates when the fixed-step cap leaves work behind", async () => {
        const framePlatform = createFramePlatform();
        const updates: LoopFrameUpdate[] = [];
        const renders: LoopFrameRender[] = [];
        const loop = createLoop({
            fixedStepMs: 10,
            maxUpdatesPerFrame: 2,
            platform: framePlatform.platform,
            onFrameUpdate(update) {
                updates.push(update);
            },
            onFrameRender(render) {
                renders.push(render);
            },
        });

        await loop.start();
        framePlatform.fire(100);
        framePlatform.fire(135);

        expect(updates[1]).toEqual({
            frameDeltaMs: 35,
            rawFrameDeltaMs: 35,
            fixedStepMs: 10,
            updateSteps: 2,
            droppedUpdates: true,
        });
        expect(renders[1]).toEqual({
            alpha: 0,
            frameDeltaMs: 35,
            rawFrameDeltaMs: 35,
        });
    });

    it("does not report dropped updates when the cap is exactly satisfied", async () => {
        const framePlatform = createFramePlatform();
        const updates: LoopFrameUpdate[] = [];
        const loop = createLoop({
            fixedStepMs: 10,
            maxUpdatesPerFrame: 2,
            platform: framePlatform.platform,
            onFrameUpdate(update) {
                updates.push(update);
            },
            onFrameRender() {},
        });

        await loop.start();
        framePlatform.fire(100);
        framePlatform.fire(120);

        expect(updates[1]).toEqual({
            frameDeltaMs: 20,
            rawFrameDeltaMs: 20,
            fixedStepMs: 10,
            updateSteps: 2,
            droppedUpdates: false,
        });
    });

    it("cancels the pending frame on stop and dispose", async () => {
        const framePlatform = createFramePlatform();
        const loop = createLoop({
            platform: framePlatform.platform,
            onFrameUpdate() {},
            onFrameRender() {},
        });

        await loop.start();
        expect(framePlatform.requested).toEqual([1]);

        await loop.stop();
        expect(framePlatform.cancelled).toEqual([1]);

        await loop.start();
        expect(framePlatform.requested).toEqual([1, 2]);

        await loop.dispose();
        expect(framePlatform.cancelled).toEqual([1, 2]);
    });
});
