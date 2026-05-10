import { afterEach, describe, expect, it, vi } from "vitest";
import { createFakeCanvas, createFakeWebGl2 } from "../../testing/FakeWebGl2.test-utils";
import { createGfx } from "./Gfx.service";

describe("GfxService", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("selects WebGL2 and publishes ok state", async () => {
        vi.stubGlobal("navigator", undefined);
        const gl = createFakeWebGl2();
        const gfx = createGfx({ canvas: createFakeCanvas(gl) });

        await gfx.start();

        expect(gfx.view.backend).toBe("webgl2");
        expect(gfx.view.state).toBe("ok");
        expect(gfx.view.requestedBackend).toBe("auto");
        expect(gfx.view.selectedBackend).toBe("webgl2");
        expect(gfx.view.fallbackBackend).toBeUndefined();
        expect(gfx.view.unavailableBackend).toBeUndefined();
        expect(gfx.view.detectedBackends).toEqual([]);
        expect(gfx.view.lostBackend).toBeUndefined();
        const runtime = gfx.getRuntime();
        expect(runtime?.backend).toBe("webgl2");
        if (runtime?.backend !== "webgl2") {
            throw new Error("expected WebGL2 runtime");
        }
        expect(runtime.handle).toBe(gl);

        await gfx.dispose();
    });

    it("detects WebGPU without selecting it before WebGPU acquisition exists", async () => {
        vi.stubGlobal("navigator", { gpu: {} });
        const gl = createFakeWebGl2();
        const gfx = createGfx({ canvas: createFakeCanvas(gl) });

        await gfx.start();

        expect(gfx.view.detectedBackends).toEqual(["webgpu"]);
        expect(gfx.view.selectedBackend).toBe("webgl2");
        expect(gfx.view.backend).toBe("webgl2");
        expect(gfx.view.fallbackBackend).toBeUndefined();
        expect(gfx.getRuntime()?.backend).toBe("webgl2");

        await gfx.dispose();
    });

    it("selects none when WebGL2 is unavailable", async () => {
        vi.stubGlobal("navigator", undefined);
        const gfx = createGfx({ canvas: createFakeCanvas(null) });

        await gfx.start();

        expect(gfx.view.backend).toBe("none");
        expect(gfx.view.state).toBe("unavailable");
        expect(gfx.view.requestedBackend).toBe("auto");
        expect(gfx.view.selectedBackend).toBe("none");
        expect(gfx.view.unavailableBackend).toBe("webgl2");
        expect(gfx.view.fallbackBackend).toBeUndefined();
        expect(gfx.view.detectedBackends).toEqual([]);
        expect(gfx.getRuntime()).toBeUndefined();

        await gfx.dispose();
    });

    it("records detected WebGPU without treating WebGL2 fallback as selected fallback", async () => {
        vi.stubGlobal("navigator", { gpu: {} });
        const gfx = createGfx({ canvas: createFakeCanvas(null) });

        await gfx.start();

        expect(gfx.view.backend).toBe("none");
        expect(gfx.view.selectedBackend).toBe("none");
        expect(gfx.view.detectedBackends).toEqual(["webgpu"]);
        expect(gfx.view.unavailableBackend).toBe("webgl2");
        expect(gfx.view.fallbackBackend).toBeUndefined();
        expect(gfx.getRuntime()).toBeUndefined();

        await gfx.dispose();
    });

    it("does not require browser navigator globals during startup", async () => {
        vi.stubGlobal("navigator", undefined);
        const gfx = createGfx({ canvas: createFakeCanvas(null) });

        await expect(gfx.start()).resolves.toBe(true);
        expect(gfx.view.detectedBackends).toEqual([]);

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
        expect(gfx.view.lostBackend).toBe("webgl2");
        expect(gfx.getRuntime()).toBeUndefined();

        await gfx.dispose();
    });
});
