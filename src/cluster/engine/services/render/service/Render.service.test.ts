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

function createTexturedInput() {
    return {
        target: { w: 100, h: 100, dpr: 1 },
        alpha: 1,
        layers: [
            {
                id: "main",
                order: 0,
                items: [
                    {
                        kind: "sprite",
                        sortKey: 0,
                        x: 0,
                        y: 0,
                        w: 10,
                        h: 10,
                        resourceId: "sprite.player",
                    },
                    {
                        kind: "sprite",
                        sortKey: 1,
                        x: 20,
                        y: 0,
                        w: 10,
                        h: 10,
                        resourceId: "missing.sprite",
                    },
                ],
            },
        ],
    } as const;
}

function createTextInput() {
    return {
        target: { w: 100, h: 100, dpr: 1 },
        alpha: 1,
        layers: [
            {
                id: "main",
                order: 0,
                items: [
                    {
                        kind: "text",
                        sortKey: 0,
                        x: 0,
                        y: 0,
                        text: "A",
                        fontId: "font.ui",
                        tint: { r: 0.25, g: 0.5, b: 0.75 },
                        opacity: 0.8,
                    },
                ],
            },
        ],
    } as const;
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
    fontResourceCount: 0,
    fontPageResourceCount: 0,
    fontReplacementRegistrationCount: 0,
    invalidFontRegistrationCount: 0,
    missingFontCount: 0,
    missingGlyphCount: 0,
    textItemCount: 0,
    preparedGlyphCount: 0,
    glyphVertexCount: 0,
    textBatchCount: 0,
};

function createFont() {
    return {
        id: "font.ui",
        kind: "bitmap",
        baseSize: 16,
        lineHeight: 20,
        baseline: 14,
        pages: [
            {
                id: "main",
                resourceId: "font.ui.page.main",
                width: 64,
                height: 32,
            },
        ],
        glyphs: [
            {
                codepoint: 65,
                pageId: "main",
                x: 0,
                y: 0,
                w: 8,
                h: 10,
                xOffset: 0,
                yOffset: 0,
                xAdvance: 8,
            },
        ],
    } as const;
}

function createFontTexture() {
    return {
        id: "font.ui.page.main",
        width: 1,
        height: 1,
        data: new Uint8Array([255, 255, 255, 255]),
    };
}

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

    it("publishes prepared text lowering stats while running", async () => {
        const render = createRender({ canvas: createCanvas() });

        await render.start();
        render.register.fonts([createFont()]);
        render.prepare({
            target: { w: 320, h: 240, dpr: 2 },
            alpha: 1,
            layers: [
                {
                    id: "main",
                    order: 0,
                    items: [
                        {
                            kind: "text",
                            sortKey: 0,
                            x: 0,
                            y: 0,
                            text: "A",
                            fontId: "font.ui",
                        },
                    ],
                },
            ],
        });

        expect(render.view.stats).toMatchObject({
            commandCount: 1,
            batchCount: 1,
            vertexCount: 6,
            textItemCount: 1,
            preparedGlyphCount: 1,
            glyphVertexCount: 6,
            textBatchCount: 1,
            fontResourceCount: 1,
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

    it("registers startup font resources after texture resources", async () => {
        const render = createRender({
            canvas: createCanvas(),
            resources: {
                textures: [
                    {
                        id: "font.ui.page.main",
                        width: 1,
                        height: 1,
                        data: new Uint8Array([255, 255, 255, 255]),
                    },
                ],
                fonts: [createFont()],
            },
        });

        await render.start();

        expect(render.view.stats).toMatchObject({
            textureResourceCount: 1,
            fontResourceCount: 1,
            fontPageResourceCount: 1,
            invalidFontRegistrationCount: 0,
        });

        await render.dispose();
    });

    it("registers dynamic font resources and records replacement counters", async () => {
        const render = createRender({ canvas: createCanvas() });

        await render.start();
        render.register.fonts([createFont()]);
        render.register.fonts([
            {
                ...createFont(),
                lineHeight: 24,
            },
        ]);

        expect(render.view.stats).toMatchObject({
            fontResourceCount: 1,
            fontPageResourceCount: 1,
            fontReplacementRegistrationCount: 1,
        });
        expect("registerFontResources" in render).toBe(false);

        await render.dispose();
    });

    it("records invalid dynamic font registration without changing textures", async () => {
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
        render.register.fonts([
            {
                ...createFont(),
                baseSize: 0,
            },
        ]);

        expect(render.view.stats).toMatchObject({
            textureResourceCount: 1,
            fontResourceCount: 0,
            invalidFontRegistrationCount: 1,
        });

        await render.dispose();
    });

    it("clears font metadata and counters on dispose", async () => {
        const render = createRender({ canvas: createCanvas() });

        await render.start();
        render.register.fonts([createFont()]);
        expect(render.view.stats.fontResourceCount).toBe(1);

        await render.dispose();

        expect(render.view.stats).toEqual(ZERO_STATS);
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
        expect(() => render.register.fonts([])).toThrow(
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
            status: "submitted",
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

    it("recovers WebGL2 submission parity after context restore", async () => {
        vi.stubGlobal("navigator", undefined);
        const firstGl = createFakeWebGl2();
        const restoredGl = createFakeWebGl2();
        const canvas = createFakeCanvas(firstGl);
        const render = createRender({
            canvas,
            resources: {
                textures: [
                    {
                        id: "sprite.player",
                        width: 1,
                        height: 1,
                        data: new Uint8Array([255, 255, 255, 255]),
                    },
                ],
            },
        });

        await render.start();
        render.prepare(createTexturedInput());
        expect(render.execute()).toEqual({ status: "submitted" });
        expect(render.view.stats).toMatchObject({
            drawCallCount: 2,
            vertexCount: 12,
            fallbackResourceCount: 1,
        });

        render.prepare(createTexturedInput());
        canvas.dispatchContextLost();
        expect(render.execute()).toEqual({
            status: "skipped",
            reason: "gfx-lost",
        });

        canvas.getContext.mockImplementation((kind: string) =>
            kind === "webgl2" ? restoredGl : null,
        );
        canvas.dispatchContextRestored();
        render.prepare(createTexturedInput());
        expect(render.execute()).toEqual({ status: "submitted" });
        expect(render.view.backend).toBe("webgl2");
        expect(render.view.gfxState).toBe("ok");
        expect(render.view.stats).toMatchObject({
            drawCallCount: 2,
            vertexCount: 12,
            fallbackResourceCount: 1,
            textureResourceCount: 1,
        });
        expect(restoredGl.texImage2D).toHaveBeenCalled();
        expect(restoredGl.drawArrays).toHaveBeenCalledTimes(2);

        await render.dispose();
    });

    it("recovers WebGL2 text submission without re-registering font metadata", async () => {
        vi.stubGlobal("navigator", undefined);
        const firstGl = createFakeWebGl2();
        const restoredGl = createFakeWebGl2();
        const canvas = createFakeCanvas(firstGl);
        const render = createRender({
            canvas,
            resources: {
                textures: [createFontTexture()],
                fonts: [createFont()],
            },
        });

        await render.start();
        render.prepare(createTextInput());
        expect(render.execute()).toEqual({ status: "submitted" });
        expect(render.view.stats).toMatchObject({
            drawCallCount: 1,
            vertexCount: 6,
            textItemCount: 1,
            preparedGlyphCount: 1,
            fontResourceCount: 1,
            fontPageResourceCount: 1,
            textureResourceCount: 1,
        });

        render.prepare(createTextInput());
        canvas.dispatchContextLost();
        expect(render.execute()).toEqual({
            status: "skipped",
            reason: "gfx-lost",
        });

        canvas.getContext.mockImplementation((kind: string) =>
            kind === "webgl2" ? restoredGl : null,
        );
        canvas.dispatchContextRestored();
        render.prepare(createTextInput());
        expect(render.execute()).toEqual({ status: "submitted" });
        expect(render.view.stats).toMatchObject({
            drawCallCount: 1,
            vertexCount: 6,
            textItemCount: 1,
            preparedGlyphCount: 1,
            textBatchCount: 1,
            fontResourceCount: 1,
            fontPageResourceCount: 1,
            textureResourceCount: 1,
        });
        expect(restoredGl.texImage2D).toHaveBeenCalled();
        expect(restoredGl.drawArrays).toHaveBeenCalledWith(restoredGl.TRIANGLES, 0, 6);

        await render.dispose();
    });

    it("submits WebGPU prepared frames and publishes metrics", async () => {
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

        expect(render.execute()).toEqual({ status: "submitted" });
        expect(render.view.backend).toBe("webgpu");
        expect(render.view.gfxState).toBe("ok");
        expect(render.view.stats).toMatchObject({
            drawCallCount: 1,
            vertexCount: 6,
            skippedResourceCount: 0,
            fallbackResourceCount: 0,
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

    it("recovers WebGPU submission parity with a replacement device", async () => {
        const firstWebGpu = createFakeWebGpu();
        const recoveredWebGpu = createFakeWebGpu();
        vi.stubGlobal("navigator", { gpu: firstWebGpu });
        const canvas = createFakeWebGpuCanvas(firstWebGpu);
        const render = createRender({
            canvas,
            resources: {
                textures: [
                    {
                        id: "sprite.player",
                        width: 1,
                        height: 1,
                        data: new Uint8Array([255, 255, 255, 255]),
                    },
                ],
            },
        });

        await render.start();
        render.prepare(createTexturedInput());
        expect(render.execute()).toEqual({ status: "submitted" });
        expect(render.view.stats).toMatchObject({
            drawCallCount: 2,
            vertexCount: 12,
            fallbackResourceCount: 1,
        });

        render.prepare(createTexturedInput());
        await firstWebGpu.device.lose();
        vi.stubGlobal("navigator", { gpu: recoveredWebGpu });
        canvas.getContext.mockImplementation((kind: string) => {
            if (kind === "webgpu") return recoveredWebGpu.context;
            return null;
        });
        expect(render.execute()).toEqual({
            status: "skipped",
            reason: "gfx-lost",
        });
        await vi.waitFor(() =>
            expect(recoveredWebGpu.adapter.requestDevice).toHaveBeenCalledTimes(1),
        );

        render.prepare(createTexturedInput());
        expect(render.execute()).toEqual({ status: "submitted" });
        expect(render.view.backend).toBe("webgpu");
        expect(render.view.gfxState).toBe("ok");
        expect(render.view.stats).toMatchObject({
            drawCallCount: 2,
            vertexCount: 12,
            fallbackResourceCount: 1,
            textureResourceCount: 1,
        });
        expect(recoveredWebGpu.device.queue.writeTexture).toHaveBeenCalled();
        expect(recoveredWebGpu.device.createBindGroup).toHaveBeenCalled();
        expect(recoveredWebGpu.renderPass.draw).toHaveBeenCalledTimes(2);

        await render.dispose();
    });

    it("recovers WebGPU text submission without re-registering font metadata", async () => {
        const firstWebGpu = createFakeWebGpu();
        const recoveredWebGpu = createFakeWebGpu();
        vi.stubGlobal("navigator", { gpu: firstWebGpu });
        const canvas = createFakeWebGpuCanvas(firstWebGpu);
        const render = createRender({
            canvas,
            resources: {
                textures: [createFontTexture()],
                fonts: [createFont()],
            },
        });

        await render.start();
        render.prepare(createTextInput());
        expect(render.execute()).toEqual({ status: "submitted" });
        expect(render.view.stats).toMatchObject({
            drawCallCount: 1,
            vertexCount: 6,
            textItemCount: 1,
            preparedGlyphCount: 1,
            fontResourceCount: 1,
            fontPageResourceCount: 1,
            textureResourceCount: 1,
        });

        render.prepare(createTextInput());
        await firstWebGpu.device.lose();
        vi.stubGlobal("navigator", { gpu: recoveredWebGpu });
        canvas.getContext.mockImplementation((kind: string) => {
            if (kind === "webgpu") return recoveredWebGpu.context;
            return null;
        });
        expect(render.execute()).toEqual({
            status: "skipped",
            reason: "gfx-lost",
        });
        await vi.waitFor(() =>
            expect(recoveredWebGpu.adapter.requestDevice).toHaveBeenCalledTimes(1),
        );

        render.prepare(createTextInput());
        expect(render.execute()).toEqual({ status: "submitted" });
        expect(render.view.stats).toMatchObject({
            drawCallCount: 1,
            vertexCount: 6,
            textItemCount: 1,
            preparedGlyphCount: 1,
            textBatchCount: 1,
            fontResourceCount: 1,
            fontPageResourceCount: 1,
            textureResourceCount: 1,
        });
        expect(recoveredWebGpu.device.queue.writeTexture).toHaveBeenCalled();
        expect(recoveredWebGpu.renderPass.setBindGroup).toHaveBeenCalledWith(
            0,
            expect.any(Object),
        );
        expect(recoveredWebGpu.renderPass.draw).toHaveBeenCalledWith(6);

        await render.dispose();
    });
});
