import { describe, expect, it } from "vitest";
import { createGame } from "./Game.service";
import { scene } from "../authoring/scene";
import { system } from "../authoring/system";

describe("createGame display integration", () => {
    it("starts, latches, and exposes display and input through frame context", async () => {
        const canvas = { width: 1, height: 1 } as HTMLCanvasElement;
        const keyboardTarget = new EventTarget();
        let frameCallback: FrameRequestCallback | undefined;
        let nextFrameId = 1;
        const log: string[] = [];
        const displayReads: Array<{ w: number; h: number; changed: boolean }> =
            [];
        const inputReads: boolean[] = [];
        const testScene = scene({
            id: "display.test",
            setup(ctx) {
                ctx.addSystems(
                    system({
                        id: "display.read",
                        phase: "preRender",
                        execute(gameCtx) {
                            displayReads.push({
                                w: gameCtx.display.w,
                                h: gameCtx.display.h,
                                changed: gameCtx.display.changed,
                            });
                            inputReads.push(
                                gameCtx.input.keyboard.pressed("KeyA"),
                            );
                            log.push(`display:${gameCtx.display.w}`);
                        },
                    }),
                );
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
        expect(log).toEqual(["display:320"]);

        await game.dispose();
    });
});

function keyEvent(type: string, code: string): Event {
    const event = new Event(type);
    Object.defineProperty(event, "code", { value: code });
    return event;
}
