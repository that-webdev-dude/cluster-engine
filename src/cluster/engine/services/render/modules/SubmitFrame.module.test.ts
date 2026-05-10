import { describe, expect, it } from "vitest";
import { createGpuResource } from "../gpuResource";
import { createPipelineLibrary } from "../pipelineLibrary";
import { createFakeWebGl2 } from "../testing/FakeWebGl2.test-utils";
import { createRender2DPrepare } from "./Render2DPrepare.module";
import { createSubmitFrame } from "./SubmitFrame.module";
import type { GfxRuntime } from "../gfxBackend";
import type { RenderFrameInput } from "../service/Render.types";

function createRuntime(gl = createFakeWebGl2()): GfxRuntime {
    return {
        backend: "webgl2",
        caps: {},
        handle: gl,
    };
}

function createWebGpuRuntime(): GfxRuntime {
    return {
        backend: "webgpu",
        caps: {},
    };
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

    it("skips non-WebGL2 runtimes without touching WebGL2 submit APIs", async () => {
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

        expect(submitFrame.submit(frame)).toEqual({
            result: { status: "skipped", reason: "no-submitter" },
            metrics: {
                drawCallCount: 0,
                vertexCount: 0,
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
            expect.any(Float32Array),
            gl.STREAM_DRAW,
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

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });
});
