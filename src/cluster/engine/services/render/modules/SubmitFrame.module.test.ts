import { describe, expect, it } from "vitest";
import { createFontRegistry } from "./FontRegistry.module";
import { createGpuResource } from "../backend/gpuResource";
import { createPipelineLibrary } from "../backend/pipelineLibrary";
import { createFakeWebGl2, createFakeWebGpu } from "../testing/FakeWebGl2.test-utils";
import { createRender2DPrepare } from "./Render2DPrepare.module";
import { createSubmitFrame } from "./SubmitFrame.module";
import { createTextLayout } from "./TextLayout.module";
import type { GfxRuntime } from "../backend/gfxBackend";
import type {
    RenderBitmapFontConfig,
    RenderFrameInput,
    RenderTextureResourceConfig,
} from "../service/Render.types";

function createRuntime(gl = createFakeWebGl2()): GfxRuntime {
    return {
        backend: "webgl2",
        caps: {},
        handle: gl,
    };
}

function createWebGpuRuntime(webGpu = createFakeWebGpu()): GfxRuntime {
    return {
        backend: "webgpu",
        caps: {},
        adapter: webGpu.adapter,
        device: webGpu.device,
        context: webGpu.context,
        format: "bgra8unorm",
    };
}

function createTextAtlasTexture(
    id = "font.ui.page.main",
): RenderTextureResourceConfig {
    return {
        id,
        width: 2,
        height: 2,
        data: new Uint8Array([
            255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255,
        ]),
    };
}

function createTextFont(
    resourceId = "font.ui.page.main",
): RenderBitmapFontConfig {
    return {
        id: "font.ui",
        kind: "bitmap",
        baseSize: 10,
        lineHeight: 12,
        baseline: 9,
        pages: [
            {
                id: "main",
                resourceId,
                width: 32,
                height: 16,
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
            {
                codepoint: 66,
                pageId: "main",
                x: 8,
                y: 0,
                w: 8,
                h: 10,
                xOffset: 0,
                yOffset: 0,
                xAdvance: 8,
            },
            {
                codepoint: 63,
                pageId: "main",
                x: 16,
                y: 0,
                w: 8,
                h: 10,
                xOffset: 0,
                yOffset: 0,
                xAdvance: 8,
            },
        ],
        replacementCodepoint: 63,
    };
}

function createPreparedTextFrame(
    font: RenderBitmapFontConfig = createTextFont(),
    text = "AB",
) {
    const registry = createFontRegistry({ debug: true });
    registry.register([font]);

    return createRender2DPrepare({
        fontRegistry: registry,
        textLayout: createTextLayout(),
    }).prepare(
        createInput([
            {
                id: "main",
                order: 0,
                items: [
                    {
                        kind: "text",
                        sortKey: 0,
                        x: 0,
                        y: 0,
                        text,
                        fontId: "font.ui",
                        tint: { r: 0.25, g: 0.5, b: 0.75 },
                        opacity: 0.8,
                    },
                ],
            },
        ]),
    );
}

function createInput(layers: RenderFrameInput["layers"]): RenderFrameInput {
    return {
        target: { w: 100, h: 100, dpr: 1 },
        alpha: 1,
        layers,
    };
}

describe("createSubmitFrame", () => {
    it("returns no-frame when no prepared frame exists", async () => {
        const gpuResource = createGpuResource({});
        const pipelineLibrary = createPipelineLibrary({});
        await gpuResource.start();
        await pipelineLibrary.start();
        const submitFrame = createSubmitFrame({
            getRuntime: () => createRuntime(),
            gpuResource,
            pipelineLibrary,
        });

        expect(submitFrame.submit(undefined)).toEqual({
            result: { status: "no-frame" },
            metrics: {
                drawCallCount: 0,
                vertexCount: 0,
                skippedResourceCount: 0,
                fallbackResourceCount: 0,
            },
        });

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("skips prepared frames when no runtime is available", async () => {
        const gpuResource = createGpuResource({});
        const pipelineLibrary = createPipelineLibrary({});
        await gpuResource.start();
        await pipelineLibrary.start();
        const frame = createRender2DPrepare().prepare(
            createInput([
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
            ]),
        );
        const submitFrame = createSubmitFrame({
            getRuntime: () => undefined,
            gpuResource,
            pipelineLibrary,
        });

        expect(submitFrame.submit(frame)).toEqual({
            result: { status: "skipped", reason: "no-submitter" },
            metrics: {
                drawCallCount: 0,
                vertexCount: 0,
                skippedResourceCount: 0,
                fallbackResourceCount: 0,
            },
        });

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("submits WebGPU runtimes without touching WebGL2 submit APIs", async () => {
        const gl = createFakeWebGl2();
        const gpuResource = createGpuResource({});
        const pipelineLibrary = createPipelineLibrary({});
        await gpuResource.start();
        await pipelineLibrary.start();
        const frame = createRender2DPrepare().prepare(
            createInput([
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
            ]),
        );
        const submitFrame = createSubmitFrame({
            getRuntime: createWebGpuRuntime,
            gpuResource,
            pipelineLibrary,
        });

        expect(submitFrame.submit(frame)).toMatchObject({
            result: { status: "submitted" },
            metrics: {
                drawCallCount: 1,
                vertexCount: 6,
                skippedResourceCount: 0,
                fallbackResourceCount: 0,
            },
        });
        expect(gl.viewport).not.toHaveBeenCalled();
        expect(gl.clear).not.toHaveBeenCalled();
        expect(gl.drawArrays).not.toHaveBeenCalled();

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("clears and submits an empty prepared frame", async () => {
        const gl = createFakeWebGl2();
        const gpuResource = createGpuResource({});
        const pipelineLibrary = createPipelineLibrary({});
        await gpuResource.start();
        await pipelineLibrary.start();
        const frame = createRender2DPrepare().prepare(createInput([]));
        const submitFrame = createSubmitFrame({
            getRuntime: () => createRuntime(gl),
            gpuResource,
            pipelineLibrary,
        });

        expect(submitFrame.submit(frame).result).toEqual({ status: "submitted" });
        expect(gl.clear).toHaveBeenCalledWith(gl.COLOR_BUFFER_BIT);
        expect(gl.drawArrays).not.toHaveBeenCalled();

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("uploads packed solid vertices and draws one rect batch", async () => {
        const gl = createFakeWebGl2();
        const gpuResource = createGpuResource({});
        const pipelineLibrary = createPipelineLibrary({});
        await gpuResource.start();
        await pipelineLibrary.start();
        const frame = createRender2DPrepare().prepare(
            createInput([
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
                            color: { r: 0.25, g: 0.5, b: 0.75 },
                            opacity: 0.8,
                        },
                    ],
                },
            ]),
        );
        const submitFrame = createSubmitFrame({
            getRuntime: () => createRuntime(gl),
            gpuResource,
            pipelineLibrary,
        });

        const report = submitFrame.submit(frame);

        expect(report).toMatchObject({
            result: { status: "submitted" },
            metrics: {
                drawCallCount: 1,
                vertexCount: 6,
                skippedResourceCount: 0,
                fallbackResourceCount: 0,
            },
        });
        expect(gl.bufferData).toHaveBeenCalledWith(
            gl.ARRAY_BUFFER,
            expect.any(Number),
            gl.STREAM_DRAW,
        );
        expect(gl.bufferSubData).toHaveBeenCalledWith(
            gl.ARRAY_BUFFER,
            0,
            expect.any(Float32Array),
        );
        expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("binds fallback texture and records fallback metrics for missing sprites", async () => {
        const gl = createFakeWebGl2();
        const gpuResource = createGpuResource({});
        const pipelineLibrary = createPipelineLibrary({});
        await gpuResource.start();
        await pipelineLibrary.start();
        const frame = createRender2DPrepare().prepare(
            createInput([
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
                            resourceId: "missing.sprite",
                        },
                    ],
                },
            ]),
        );
        const submitFrame = createSubmitFrame({
            getRuntime: () => createRuntime(gl),
            gpuResource,
            pipelineLibrary,
        });

        const report = submitFrame.submit(frame);

        expect(report).toMatchObject({
            result: { status: "submitted" },
            metrics: {
                drawCallCount: 1,
                vertexCount: 6,
                skippedResourceCount: 0,
                fallbackResourceCount: 1,
            },
        });
        expect(gl.bindTexture).toHaveBeenCalledWith(
            gl.TEXTURE_2D,
            expect.any(Object),
        );
        expect(gl.uniform1i).toHaveBeenCalledWith(expect.any(Object), 0);

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("submits WebGL2 text glyph batches through the textured path", async () => {
        const gl = createFakeWebGl2();
        const gpuResource = createGpuResource({});
        const pipelineLibrary = createPipelineLibrary({});
        await gpuResource.start();
        await pipelineLibrary.start();
        gpuResource.registerTextureResource(createTextAtlasTexture());
        const frame = createPreparedTextFrame();
        const submitFrame = createSubmitFrame({
            getRuntime: () => createRuntime(gl),
            gpuResource,
            pipelineLibrary,
        });

        expect(frame.stats).toMatchObject({
            commandCount: 2,
            batchCount: 1,
            vertexCount: 12,
            textItemCount: 1,
            preparedGlyphCount: 2,
            glyphVertexCount: 12,
            missingFontCount: 0,
            missingGlyphCount: 0,
        });
        expect(frame.batches[0]).toMatchObject({
            pipelineFamily: "textured-2d",
            vertexLayout: "position-uv-tint-2d",
            blendMode: "alpha",
            resourceId: "font.ui.page.main",
            containsText: true,
            vertexCount: 12,
        });

        const report = submitFrame.submit(frame);

        expect(report).toMatchObject({
            result: { status: "submitted" },
            metrics: {
                drawCallCount: 1,
                vertexCount: 12,
                skippedResourceCount: 0,
                fallbackResourceCount: 0,
            },
        });
        expect(gl.bindTexture).toHaveBeenCalledWith(
            gl.TEXTURE_2D,
            expect.any(Object),
        );
        expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 12);

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("keeps missing texture fallback separate from text counters", async () => {
        const gl = createFakeWebGl2();
        const gpuResource = createGpuResource({});
        const pipelineLibrary = createPipelineLibrary({});
        await gpuResource.start();
        await pipelineLibrary.start();
        const frame = createPreparedTextFrame(
            createTextFont("font.ui.page.missing-texture"),
            "AZ",
        );
        const submitFrame = createSubmitFrame({
            getRuntime: () => createRuntime(gl),
            gpuResource,
            pipelineLibrary,
        });

        expect(frame.stats).toMatchObject({
            preparedGlyphCount: 2,
            missingFontCount: 0,
            missingGlyphCount: 1,
        });
        expect(frame.batches[0]).toMatchObject({
            resourceId: "font.ui.page.missing-texture",
            containsText: true,
        });

        const report = submitFrame.submit(frame);

        expect(report).toMatchObject({
            result: { status: "submitted" },
            metrics: {
                drawCallCount: 1,
                vertexCount: 12,
                skippedResourceCount: 0,
                fallbackResourceCount: 1,
            },
        });

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("submits WebGPU text glyph batches through the textured path", async () => {
        const webGpu = createFakeWebGpu();
        const gpuResource = createGpuResource({});
        const pipelineLibrary = createPipelineLibrary({});
        await gpuResource.start();
        await pipelineLibrary.start();
        gpuResource.registerTextureResource(createTextAtlasTexture());
        const frame = createPreparedTextFrame();
        const submitFrame = createSubmitFrame({
            getRuntime: () => createWebGpuRuntime(webGpu),
            gpuResource,
            pipelineLibrary,
        });

        expect(frame.stats).toMatchObject({
            batchCount: 1,
            preparedGlyphCount: 2,
            glyphVertexCount: 12,
            textBatchCount: 1,
        });
        expect(frame.batches[0]).toMatchObject({
            pipelineFamily: "textured-2d",
            vertexLayout: "position-uv-tint-2d",
            resourceId: "font.ui.page.main",
            containsText: true,
        });

        const report = submitFrame.submit(frame);

        expect(report).toMatchObject({
            result: { status: "submitted" },
            metrics: {
                drawCallCount: 1,
                vertexCount: 12,
                skippedResourceCount: 0,
                fallbackResourceCount: 0,
            },
        });
        expect(webGpu.device.queue.writeTexture).toHaveBeenCalledWith(
            expect.any(Object),
            expect.any(Uint8Array),
            expect.objectContaining({ bytesPerRow: 8 }),
            expect.objectContaining({ width: 2, height: 2 }),
        );
        expect(webGpu.renderPass.setBindGroup).toHaveBeenCalledWith(
            0,
            expect.any(Object),
        );
        expect(webGpu.renderPass.draw).toHaveBeenCalledWith(12);

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("preserves mixed prepared batch order and draw counts", async () => {
        const gl = createFakeWebGl2();
        const gpuResource = createGpuResource({});
        const pipelineLibrary = createPipelineLibrary({});
        await gpuResource.start();
        await pipelineLibrary.start();
        gpuResource.registerTextureResource({
            id: "sprite.a",
            width: 1,
            height: 1,
            data: new Uint8Array([255, 255, 255, 255]),
        });
        const frame = createRender2DPrepare().prepare(
            createInput([
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
                        {
                            kind: "sprite",
                            sortKey: 1,
                            x: 0,
                            y: 0,
                            w: 10,
                            h: 10,
                            resourceId: "sprite.a",
                        },
                        {
                            kind: "rect",
                            sortKey: 2,
                            x: 0,
                            y: 0,
                            w: 10,
                            h: 10,
                            blend: "alpha",
                        },
                    ],
                },
            ]),
        );
        const submitFrame = createSubmitFrame({
            getRuntime: () => createRuntime(gl),
            gpuResource,
            pipelineLibrary,
        });

        const report = submitFrame.submit(frame);

        expect(report).toMatchObject({
            result: { status: "submitted" },
            metrics: {
                drawCallCount: 3,
                vertexCount: 18,
                fallbackResourceCount: 0,
            },
        });
        expect(gl.drawArrays).toHaveBeenCalledTimes(3);
        expect(gl.bufferSubData).toHaveBeenCalledTimes(2);
        expect(gl.vertexAttribPointer).toHaveBeenCalledWith(
            0,
            2,
            gl.FLOAT,
            false,
            24,
            144,
        );
        expect(gl.vertexAttribPointer).toHaveBeenCalledWith(
            1,
            4,
            gl.FLOAT,
            false,
            24,
            152,
        );

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("skips WebGL2 submission when no pipeline can be created", async () => {
        const gl = createFakeWebGl2();
        gl.createProgram.mockReturnValueOnce(null);
        const gpuResource = createGpuResource({});
        const pipelineLibrary = createPipelineLibrary({});
        await gpuResource.start();
        await pipelineLibrary.start();
        const frame = createRender2DPrepare().prepare(
            createInput([
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
            ]),
        );
        const submitFrame = createSubmitFrame({
            getRuntime: () => createRuntime(gl),
            gpuResource,
            pipelineLibrary,
        });

        expect(submitFrame.submit(frame)).toEqual({
            result: { status: "skipped", reason: "no-submitter" },
            metrics: {
                drawCallCount: 0,
                vertexCount: 0,
                skippedResourceCount: 0,
                fallbackResourceCount: 0,
            },
        });
        expect(gl.drawArrays).not.toHaveBeenCalled();

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });
});
