import { afterEach, describe, expect, it, vi } from "vitest";
import {
    createFakeCanvas,
    createFakeWebGl2,
    createFakeWebGpu,
    createFakeWebGpuCanvas,
} from "../testing/FakeWebGl2.test-utils";
import { createRender } from "./Render.service";

function createCanvas() {
    return { width: 10, height: 20 } as HTMLCanvasElement;
}

function createInput() {
    return {
        target: { w: 320, h: 240, dpr: 2 },
        alpha: 0.5,
        layers: [],
    };
}

const ZERO_STATS = {
    passCount: 0,
    commandCount: 0,
    batchCount: 0,
    drawCallCount: 0,
    vertexCount: 0,
    skippedResourceCount: 0,
    fallbackResourceCount: 0,
    textureResourceCount: 0,
};

describe("createRender", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("publishes a sealed default view", () => {
        const render = createRender({ canvas: createCanvas() });

        expect(Object.isFrozen(render)).toBe(true);
        expect(Object.isFrozen(render.register)).toBe(true);
        expect(render.view.backend).toBe("none");
        expect(render.view.gfxState).toBe("unavailable");
        expect(render.view.frameSeq).toBe(0);
        expect(render.view.target).toEqual({ w: 0, h: 0, dpr: 1 });
        expect(render.view.lastSubmitResult).toEqual({ status: "no-frame" });
        expect(render.view.stats).toEqual(ZERO_STATS);
        expect("gfx" in render.view).toBe(false);
        expect("renderFrame" in render.view).toBe(false);
        expect("pipelineLibrary" in render.view).toBe(false);
        expect("gpuResource" in render.view).toBe(false);
    });

    it("records prepared frame shell state while running", async () => {
        const render = createRender({ canvas: createCanvas() });

        await render.start();
        render.prepare(createInput());

        expect(render.view.frameSeq).toBe(1);
        expect(render.view.target).toEqual({ w: 320, h: 240, dpr: 2 });
        expect(render.view.lastSubmitResult).toEqual({ status: "no-frame" });
        expect(render.view.stats).toEqual(ZERO_STATS);

        await render.dispose();
    });

    it("records prepared renderer-domain item stats while running", async () => {
        const render = createRender({ canvas: createCanvas() });

        await render.start();
        render.prepare({
            target: { w: 320, h: 240, dpr: 2 },
            alpha: 0.5,
            layers: [
                {
                    id: "main",
                    order: 0,
                    items: [
                        {
                            kind: "rect",
                            sortKey: 0,
                            x: 0,
                            y: 0,
                            w: 10,
                            h: 20,
                        },
                    ],
                },
            ],
        });

        expect(render.view.stats).toEqual({
            ...ZERO_STATS,
            passCount: 1,
            commandCount: 1,
            batchCount: 1,
            vertexCount: 6,
        });

        await render.dispose();
    });

    it("returns no-frame before prepare and no-submitter after prepare", async () => {
        const render = createRender({ canvas: createCanvas() });

        await render.start();

        expect(render.execute()).toEqual({ status: "no-frame" });
        expect(render.view.lastSubmitResult).toEqual({ status: "no-frame" });

        render.prepare(createInput());

        expect(render.execute()).toEqual({
            status: "skipped",
            reason: "no-submitter",
        });
        expect(render.view.lastSubmitResult).toEqual({
            status: "skipped",
            reason: "no-submitter",
        });

        expect(render.execute()).toEqual({ status: "no-frame" });

        await render.dispose();
    });

    it("keeps texture registration behind the public register boundary", async () => {
        const render = createRender({
            canvas: createCanvas(),
            resources: {
                textures: [
                    {
                        id: "texture.initial",
                        width: 1,
                        height: 1,
                        data: new Uint8Array([255, 255, 255, 255]),
                    },
                ],
            },
        });

        await render.start();

        expect(render.view.stats.textureResourceCount).toBe(1);

        render.register.textures([
            {
                id: "texture.dynamic",
                width: 1,
                height: 1,
                data: new Uint8Array([0, 0, 0, 255]),
            },
        ]);

        expect(render.view.stats.textureResourceCount).toBe(2);
        expect("registerTextureResources" in render).toBe(false);

        await render.dispose();
    });

    it("does not prepare while stopped and publishes not-running on execute", () => {
        const render = createRender({ canvas: createCanvas() });

        render.prepare(createInput());

        expect(render.view.frameSeq).toBe(0);
        expect(render.view.target).toEqual({ w: 0, h: 0, dpr: 1 });
        expect(render.execute()).toEqual({
            status: "skipped",
            reason: "not-running",
        });
        expect(render.view.lastSubmitResult).toEqual({
            status: "skipped",
            reason: "not-running",
        });
    });

    it("throws for prepare and execute while stopped in debug mode", async () => {
        const render = createRender({
            canvas: createCanvas(),
            debug: true,
        });

        await render.start();
        await render.stop();

        expect(() => render.prepare(createInput())).toThrow(
            "RenderService.prepare: service is not running",
        );
        expect(() => render.execute()).toThrow(
            "RenderService.execute: service is not running",
        );

        await render.dispose();
    });

    it("throws for invalid render alpha in debug mode", async () => {
        const render = createRender({
            canvas: createCanvas(),
            debug: true,
        });

        await render.start();

        expect(() =>
            render.prepare({
                target: { w: 320, h: 240, dpr: 2 },
                alpha: 1.25,
                layers: [],
            }),
        ).toThrow(
            "Render2DPrepare.prepare: alpha must be a finite number between 0 and 1",
        );

        await render.dispose();
    });

    it("guards debug calls after dispose", async () => {
        const render = createRender({
            canvas: createCanvas(),
            debug: true,
        });

        await render.start();
        await render.dispose();

        expect(() => render.prepare(createInput())).toThrow(
            "RenderService.assertNotDisposed: called after dispose()",
        );
        expect(() => render.execute()).toThrow(
            "RenderService.assertNotDisposed: called after dispose()",
        );
        expect(() => render.register.textures([])).toThrow(
            "RenderService.assertNotDisposed: called after dispose()",
        );
    });

    it("submits through WebGL2 and publishes backend metrics", async () => {
        const gl = createFakeWebGl2();
        const render = createRender({ canvas: createFakeCanvas(gl) });

        await render.start();
        render.prepare({
            target: { w: 100, h: 100, dpr: 1 },
            alpha: 1,
            layers: [
                {
                    id: "main",
                    order: 0,
                    items: [
                        {
                            kind: "rect",
                            sortKey: 0,
                            x: 0,
                            y: 0,
                            w: 10,
                            h: 10,
                        },
                    ],
                },
            ],
        });

        expect(render.execute()).toEqual({ status: "submitted" });
        expect(render.view.backend).toBe("webgl2");
        expect(render.view.gfxState).toBe("ok");
        expect(render.view.stats).toMatchObject({
            drawCallCount: 1,
            vertexCount: 6,
            skippedResourceCount: 0,
            fallbackResourceCount: 0,
        });

        await render.dispose();
    });

    it("skips WebGL2 execution while context is lost", async () => {
        const gl = createFakeWebGl2();
        const canvas = createFakeCanvas(gl);
        const render = createRender({ canvas });

        await render.start();
        render.prepare({
            target: { w: 100, h: 100, dpr: 1 },
            alpha: 1,
            layers: [
                {
                    id: "main",
                    order: 0,
                    items: [
                        {
                            kind: "rect",
                            sortKey: 0,
                            x: 0,
                            y: 0,
                            w: 10,
                            h: 10,
                        },
                    ],
                },
            ],
        });
        canvas.dispatchContextLost();

        expect(render.execute()).toEqual({
            status: "skipped",
            reason: "gfx-lost",
        });
        expect(gl.drawArrays).not.toHaveBeenCalled();

        await render.dispose();
    });

    it("configures WebGPU surface during execute from the last prepared target", async () => {
        const webGpu = createFakeWebGpu();
        vi.stubGlobal("navigator", { gpu: webGpu });
        const canvas = createFakeWebGpuCanvas(webGpu);
        const render = createRender({ canvas });

        await render.start();
        render.prepare(createInput());

        expect(webGpu.context.configure).not.toHaveBeenCalled();
        expect(render.execute()).toEqual({
            status: "skipped",
            reason: "no-submitter",
        });

        expect(render.view.backend).toBe("webgpu");
        expect(render.view.gfxState).toBe("ok");
        expect(canvas.width).toBe(640);
        expect(canvas.height).toBe(480);
        expect(webGpu.context.configure).toHaveBeenCalledTimes(1);
        expect(webGpu.context.configure).toHaveBeenCalledWith({
            device: webGpu.device,
            format: "bgra8unorm",
            alphaMode: "premultiplied",
        });

        await render.dispose();
    });

    it("does not reconfigure an unchanged WebGPU target on later executes", async () => {
        const webGpu = createFakeWebGpu();
        vi.stubGlobal("navigator", { gpu: webGpu });
        const render = createRender({ canvas: createFakeWebGpuCanvas(webGpu) });

        await render.start();
        render.prepare(createInput());
        render.execute();
        render.prepare(createInput());
        render.execute();

        expect(webGpu.context.configure).toHaveBeenCalledTimes(1);

        await render.dispose();
    });

    it("skips WebGPU execution while device is lost", async () => {
        const webGpu = createFakeWebGpu();
        vi.stubGlobal("navigator", { gpu: webGpu });
        const render = createRender({ canvas: createFakeWebGpuCanvas(webGpu) });

        await render.start();
        render.prepare({
            target: { w: 100, h: 100, dpr: 1 },
            alpha: 1,
            layers: [
                {
                    id: "main",
                    order: 0,
                    items: [
                        {
                            kind: "rect",
                            sortKey: 0,
                            x: 0,
                            y: 0,
                            w: 10,
                            h: 10,
                        },
                    ],
                },
            ],
        });
        await webGpu.device.lose();

        expect(render.execute()).toEqual({
            status: "skipped",
            reason: "gfx-lost",
        });
        expect(render.view.backend).toBe("webgpu");
        expect(render.view.gfxState).toBe("lost");
        expect(webGpu.context.configure).not.toHaveBeenCalled();

        await render.dispose();
    });
});
