import { describe, expect, it } from "vitest";
import { createFakeCanvas, createFakeWebGl2 } from "../../testing/FakeWebGl2.test-utils";
import { createGfx } from "./Gfx.service";

describe("GfxService", () => {
    it("selects WebGL2 and publishes ok state", async () => {
        const gl = createFakeWebGl2();
        const gfx = createGfx({ canvas: createFakeCanvas(gl) });

        await gfx.start();

        expect(gfx.view.backend).toBe("webgl2");
        expect(gfx.view.state).toBe("ok");
        expect(gfx.getRuntime()?.handle).toBe(gl);

        await gfx.dispose();
    });

    it("latches WebGL2 context loss inside the renderer backend", async () => {
        const gl = createFakeWebGl2();
        const canvas = createFakeCanvas(gl);
        const gfx = createGfx({ canvas });

        await gfx.start();
        canvas.dispatchContextLost();
        gfx.latch();

        expect(gfx.view.state).toBe("lost");
        expect(gfx.getRuntime()).toBeUndefined();

        await gfx.dispose();
    });
});
