import { describe, expect, it } from "vitest";
import { createDisplay } from "./Display.service";

function createCanvas(width = 10, height = 20) {
    return { width, height } as HTMLCanvasElement;
}

describe("createDisplay", () => {
    it("initializes a fixed-size surface on latch", async () => {
        const canvas = createCanvas();
        const display = createDisplay({
            canvas,
            options: {
                mode: "fixed",
                size: { w: 320, h: 240 },
                dpr: 2,
            },
        });

        await display.start();
        display.latch();

        expect(canvas.width).toBe(320);
        expect(canvas.height).toBe(240);
        expect(display.view.w).toBe(320);
        expect(display.view.h).toBe(240);
        expect(display.view.dpr).toBe(2);
        expect(display.view.rev).toBe(1);
        expect(display.view.changed).toBe(true);

        display.latch();

        expect(display.view.rev).toBe(1);
        expect(display.view.changed).toBe(false);

        await display.dispose();
    });

    it("does not latch while stopped", () => {
        const canvas = createCanvas();
        const display = createDisplay({
            canvas,
            options: {
                mode: "fixed",
                size: { w: 320, h: 240 },
            },
        });

        display.latch();

        expect(canvas.width).toBe(10);
        expect(canvas.height).toBe(20);
        expect(display.view.w).toBe(1);
        expect(display.view.h).toBe(1);
        expect(display.view.rev).toBe(0);
        expect(display.view.changed).toBe(false);
    });

    it("detaches platform observers on dispose", async () => {
        const added: string[] = [];
        const removed: string[] = [];
        const windowLike = {
            devicePixelRatio: 1,
            addEventListener(event: string) {
                added.push(event);
            },
            removeEventListener(event: string) {
                removed.push(event);
            },
        } as unknown as Window;
        const display = createDisplay({
            canvas: createCanvas(),
            platform: { window: windowLike },
            options: { mode: "fixed" },
        });

        await display.start();
        await display.dispose();

        expect(added).toEqual(["resize"]);
        expect(removed).toEqual(["resize"]);
    });

    it("guards debug calls after dispose", async () => {
        const display = createDisplay({
            canvas: createCanvas(),
            debug: true,
            options: { mode: "fixed" },
        });

        await display.start();
        await display.dispose();

        expect(() => display.latch()).toThrow(
            "DisplayService.assertNotDisposed: called after dispose()",
        );
    });
});
