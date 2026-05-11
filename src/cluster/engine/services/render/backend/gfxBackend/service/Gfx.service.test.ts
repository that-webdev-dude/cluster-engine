import { afterEach, describe, expect, it, vi } from "vitest";
import {
    createFakeCanvas,
    createFakeWebGl2,
    createFakeWebGpu,
    createFakeWebGpuCanvas,
} from "../../../testing/FakeWebGl2.test-utils";
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

    it("selects WebGPU and publishes ok state when acquisition succeeds", async () => {
        const webGpu = createFakeWebGpu();
        vi.stubGlobal("navigator", { gpu: webGpu });
        const gfx = createGfx({ canvas: createFakeWebGpuCanvas(webGpu) });

        await gfx.start();

        expect(gfx.view.backend).toBe("webgpu");
        expect(gfx.view.state).toBe("ok");
        expect(gfx.view.detectedBackends).toEqual(["webgpu"]);
        expect(gfx.view.selectedBackend).toBe("webgpu");
        expect(gfx.view.fallbackBackend).toBeUndefined();
        expect(gfx.view.unavailableBackend).toBeUndefined();
        expect(gfx.view.caps).toEqual({
            maxTextureSize: 8192,
            maxUniformBufferSize: 65536,
            maxBufferSize: 1048576,
        });
        const runtime = gfx.getRuntime();
        expect(runtime?.backend).toBe("webgpu");
        if (runtime?.backend !== "webgpu") {
            throw new Error("expected WebGPU runtime");
        }
        expect(runtime.device).toBe(webGpu.device);
        expect(runtime.context).toBe(webGpu.context);
        expect(runtime.format).toBe("bgra8unorm");

        await gfx.dispose();
    });

    it("falls back to WebGL2 when WebGPU acquisition fails", async () => {
        const webGpu = createFakeWebGpu();
        webGpu.requestAdapter.mockResolvedValueOnce(null);
        vi.stubGlobal("navigator", { gpu: webGpu });
        const gl = createFakeWebGl2();
        const gfx = createGfx({ canvas: createFakeWebGpuCanvas(webGpu, gl) });

        await gfx.start();

        expect(gfx.view.detectedBackends).toEqual(["webgpu"]);
        expect(gfx.view.unavailableBackend).toBe("webgpu");
        expect(gfx.view.fallbackBackend).toBe("webgl2");
        expect(gfx.view.selectedBackend).toBe("webgl2");
        expect(gfx.view.backend).toBe("webgl2");
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

    it("selects none when WebGPU and WebGL2 are unavailable", async () => {
        const webGpu = createFakeWebGpu();
        webGpu.requestAdapter.mockResolvedValueOnce(null);
        vi.stubGlobal("navigator", { gpu: webGpu });
        const gfx = createGfx({ canvas: createFakeWebGpuCanvas(webGpu, null) });

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

    it("recovers WebGL2 after context restore", async () => {
        const firstGl = createFakeWebGl2();
        const restoredGl = createFakeWebGl2();
        const canvas = createFakeCanvas(firstGl);
        const gfx = createGfx({ canvas });

        await gfx.start();
        canvas.dispatchContextLost();
        gfx.latch();
        canvas.getContext.mockImplementation((kind: string) =>
            kind === "webgl2" ? restoredGl : null,
        );
        canvas.dispatchContextRestored();

        expect(gfx.recoverIfLost()).toBe(true);
        expect(gfx.view.state).toBe("ok");
        expect(gfx.view.backend).toBe("webgl2");
        expect(gfx.view.lostBackend).toBeUndefined();
        const runtime = gfx.getRuntime();
        expect(runtime?.backend).toBe("webgl2");
        if (runtime?.backend !== "webgl2") {
            throw new Error("expected WebGL2 runtime");
        }
        expect(runtime.handle).toBe(restoredGl);

        await gfx.dispose();
    });

    it("configures the WebGPU surface from target size and DPR", async () => {
        const webGpu = createFakeWebGpu();
        vi.stubGlobal("navigator", { gpu: webGpu });
        const canvas = createFakeWebGpuCanvas(webGpu);
        const gfx = createGfx({ canvas });

        await gfx.start();
        gfx.configureSurface({ w: 320, h: 240, dpr: 2 });

        expect(canvas.width).toBe(640);
        expect(canvas.height).toBe(480);
        expect(webGpu.context.configure).toHaveBeenCalledWith({
            device: webGpu.device,
            format: "bgra8unorm",
            alphaMode: "premultiplied",
        });

        await gfx.dispose();
    });

    it("does not reconfigure an unchanged WebGPU surface", async () => {
        const webGpu = createFakeWebGpu();
        vi.stubGlobal("navigator", { gpu: webGpu });
        const gfx = createGfx({ canvas: createFakeWebGpuCanvas(webGpu) });

        await gfx.start();
        gfx.configureSurface({ w: 320, h: 240, dpr: 2 });
        gfx.configureSurface({ w: 320, h: 240, dpr: 2 });

        expect(webGpu.context.configure).toHaveBeenCalledTimes(1);

        await gfx.dispose();
    });

    it("latches WebGPU device loss inside the renderer backend", async () => {
        const webGpu = createFakeWebGpu();
        vi.stubGlobal("navigator", { gpu: webGpu });
        const gfx = createGfx({ canvas: createFakeWebGpuCanvas(webGpu) });

        await gfx.start();
        await webGpu.device.lose();
        gfx.latch();

        expect(gfx.view.state).toBe("lost");
        expect(gfx.view.lostBackend).toBe("webgpu");
        expect(gfx.getRuntime()).toBeUndefined();

        await gfx.dispose();
    });

    it("recovers WebGPU with a fresh device generation", async () => {
        const firstWebGpu = createFakeWebGpu();
        const recoveredWebGpu = createFakeWebGpu();
        vi.stubGlobal("navigator", { gpu: firstWebGpu });
        const canvas = createFakeWebGpuCanvas(firstWebGpu);
        const gfx = createGfx({ canvas });

        await gfx.start();
        await firstWebGpu.device.lose();
        gfx.latch();
        vi.stubGlobal("navigator", { gpu: recoveredWebGpu });
        canvas.getContext.mockImplementation((kind: string) => {
            if (kind === "webgpu") return recoveredWebGpu.context;
            return null;
        });

        expect(gfx.recoverIfLost()).toBe(false);
        await vi.waitFor(() => expect(gfx.view.state).toBe("ok"));
        expect(gfx.view.backend).toBe("webgpu");
        expect(gfx.view.lostBackend).toBeUndefined();
        const runtime = gfx.getRuntime();
        expect(runtime?.backend).toBe("webgpu");
        if (runtime?.backend !== "webgpu") {
            throw new Error("expected WebGPU runtime");
        }
        expect(runtime.device).toBe(recoveredWebGpu.device);

        await firstWebGpu.device.lose();
        gfx.latch();
        expect(gfx.view.state).toBe("ok");

        await gfx.dispose();
    });

    it("falls back to WebGL2 while recovering from lost WebGPU", async () => {
        const firstWebGpu = createFakeWebGpu();
        const unavailableWebGpu = createFakeWebGpu();
        unavailableWebGpu.requestAdapter.mockResolvedValueOnce(null);
        const gl = createFakeWebGl2();
        vi.stubGlobal("navigator", { gpu: firstWebGpu });
        const canvas = createFakeWebGpuCanvas(firstWebGpu);
        const gfx = createGfx({ canvas });

        await gfx.start();
        await firstWebGpu.device.lose();
        gfx.latch();
        vi.stubGlobal("navigator", { gpu: unavailableWebGpu });
        canvas.getContext.mockImplementation((kind: string) => {
            if (kind === "webgpu") return unavailableWebGpu.context;
            if (kind === "webgl2") return gl;
            return null;
        });

        gfx.recoverIfLost();
        await vi.waitFor(() => expect(gfx.view.state).toBe("ok"));
        expect(gfx.view.backend).toBe("webgl2");
        expect(gfx.view.selectedBackend).toBe("webgl2");
        expect(gfx.view.unavailableBackend).toBe("webgpu");
        expect(gfx.view.fallbackBackend).toBe("webgl2");
        expect(gfx.view.lostBackend).toBeUndefined();

        await gfx.dispose();
    });

    it("ignores stale WebGPU loss after stop and restart", async () => {
        const staleWebGpu = createFakeWebGpu();
        const nextWebGpu = createFakeWebGpu();
        vi.stubGlobal("navigator", { gpu: staleWebGpu });
        const canvas = createFakeWebGpuCanvas(staleWebGpu);
        const gfx = createGfx({ canvas });

        await gfx.start();
        await gfx.stop();
        vi.stubGlobal("navigator", { gpu: nextWebGpu });
        canvas.getContext.mockImplementation((kind: string) => {
            if (kind === "webgpu") return nextWebGpu.context;
            return null;
        });
        await gfx.start();
        await staleWebGpu.device.lose();
        gfx.latch();

        expect(gfx.view.state).toBe("ok");
        expect(gfx.view.lostBackend).toBeUndefined();
        expect(gfx.getRuntime()?.backend).toBe("webgpu");

        await gfx.dispose();
    });
});
