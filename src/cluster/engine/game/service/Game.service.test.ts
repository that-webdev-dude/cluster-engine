import { describe, expect, it } from "vitest";
import { createGame } from "./Game.service";
import { entity } from "../authoring/entity";
import { scene } from "../authoring/scene";
import { system } from "../authoring/system";

describe("createGame render integration", () => {
    it("starts, latches frame state, extracts render input, and exposes render debug", async () => {
        const canvas = { width: 1, height: 1 } as HTMLCanvasElement;
        const keyboardTarget = new EventTarget();
        let frameCallback: FrameRequestCallback | undefined;
        let nextFrameId = 1;
        const displayReads: Array<{ w: number; h: number; changed: boolean }> =
            [];
        const inputReads: boolean[] = [];
        const inputReader = system({
            id: "input.reader",
            phase: "input",
            execute(ctx) {
                displayReads.push({
                    w: ctx.display.w,
                    h: ctx.display.h,
                    changed: ctx.display.changed,
                });
                inputReads.push(ctx.input.keyboard.pressed("KeyA"));
            },
        });
        const testScene = scene({
            id: "display.test",
            setup(ctx) {
                ctx.addEntities(
                    entity("rect.a", {
                        position: { x: 10, y: 20 },
                        prevPosition: { x: 5, y: 15 },
                        size: { w: 30, h: 40 },
                        color: { r: 0.25, g: 0.5, b: 0.75 },
                    }),
                );
                ctx.addSystems(inputReader);
            },
        });
        const game = createGame({
            canvas,
            initialScene: testScene,
            display: {
                mode: "fixed",
                size: { w: 320, h: 240 },
            },
            input: {
                targets: {
                    keyboard: keyboardTarget,
                },
            },
            platform: {
                requestFrame(callback) {
                    frameCallback = callback;
                    return nextFrameId++;
                },
                cancelFrame() {
                    frameCallback = undefined;
                },
            },
        });

        await game.start();
        keyboardTarget.dispatchEvent(keyEvent("keydown", "KeyA"));
        frameCallback?.(1);

        expect(canvas.width).toBe(320);
        expect(canvas.height).toBe(240);
        expect(displayReads).toEqual([{ w: 320, h: 240, changed: true }]);
        expect(inputReads).toEqual([true]);
        expect(game.debug.sceneStack.instanceIds).toEqual(["display.test"]);
        expect(game.debug.world.entityCount).toBe(1);
        expect(game.debug.render.frameSeq).toBe(1);
        expect(game.debug.render.target).toEqual({ w: 320, h: 240, dpr: 1 });
        expect(game.debug.render.stats).toMatchObject({
            passCount: 1,
            commandCount: 1,
            batchCount: 1,
        });
        expect(game.debug.render.lastSubmitResult).toEqual({
            status: "skipped",
            reason: "no-submitter",
        });

        await game.dispose();

        expect(game.debug.render.backend).toBe("none");
        expect(game.debug.render.gfxState).toBe("unavailable");
    });
});

function keyEvent(type: string, code: string): Event {
    const event = new Event(type);
    Object.defineProperty(event, "code", { value: code });
    return event;
}
