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
        const runtime = gfx.getRuntime();
        expect(runtime?.backend).toBe("webgl2");
        if (runtime?.backend !== "webgl2") {
            throw new Error("expected WebGL2 runtime");
        }
        expect(runtime.handle).toBe(gl);

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
