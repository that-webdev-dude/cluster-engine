import { describe, expect, it } from "vitest";
import type { GfxRuntime } from "../../backend/gfxBackend";
import { createGpuResource } from "../../backend/gpuResource";
import { createPipelineLibrary } from "../../backend/pipelineLibrary";
import type { RenderFrameInput } from "../../service/Render.types";
import { createFakeWebGl2 } from "../../testing/FakeWebGl2.test-utils";
import { createRender2DPrepare } from "../Render2DPrepare.module";
import { createRender2DGeometryUpload } from "../Render2DGeometryUpload.module";
import { createWebGl2Submitter } from "./WebGl2Submitter.module";

function createInput(
    layers: RenderFrameInput["layers"],
    input: Partial<Pick<RenderFrameInput, "alpha" | "camera">> = {},
): RenderFrameInput {
    return {
        target: { w: 100, h: 100, dpr: 1 },
        alpha: input.alpha ?? 1,
        camera: input.camera,
        layers,
    };
}

function createWebGl2Runtime(
    gl = createFakeWebGl2(),
): Extract<GfxRuntime, { backend: "webgl2" }> {
    return {
        backend: "webgl2",
        caps: {},
        handle: gl,
    };
}

async function createStartedSubmitter() {
    const gpuResource = createGpuResource({});
    const pipelineLibrary = createPipelineLibrary({});
    await gpuResource.start();
    await pipelineLibrary.start();
    return {
        gpuResource,
        pipelineLibrary,
        submitter: createWebGl2Submitter({
            gpuResource,
            pipelineLibrary,
            render2DGeometryUpload: createRender2DGeometryUpload(),
        }),
    };
}

describe("createWebGl2Submitter", () => {
    it("uploads a solid rect instance and submits an instanced draw", async () => {
        const gl = createFakeWebGl2();
        const { gpuResource, pipelineLibrary, submitter } =
            await createStartedSubmitter();
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

        const report = submitter.submit(frame, createWebGl2Runtime(gl));

        expect(report).toMatchObject({
            result: { status: "submitted" },
            metrics: {
                drawCallCount: 1,
                vertexCount: 6,
                uploadCallCount: 1,
                uploadByteCount: 96,
                uploadRangeCount: 1,
                uploadLayoutCount: 1,
                frameVertexBufferCreateCount: 1,
                frameVertexBufferGrowCount: 0,
                frameVertexBufferReuseCount: 0,
                frameVertexBufferCapacityBytes: 256,
                skippedResourceCount: 0,
                fallbackResourceCount: 0,
            },
        });
        expect(gl.vertexAttribDivisor).toHaveBeenCalledWith(1, 1);
        expect(gl.vertexAttribDivisor).toHaveBeenCalledWith(7, 1);
        expect(gl.uniform4f).toHaveBeenCalledWith(
            expect.any(Object),
            1,
            100,
            100,
            1,
        );
        expect(gl.uniform4f).toHaveBeenCalledWith(
            expect.any(Object),
            0,
            0,
            1,
            0,
        );
        expect(gl.uniform4f).toHaveBeenCalledWith(expect.any(Object), 0, 0, 0, 0);
        expect(gl.drawArraysInstanced).toHaveBeenCalledWith(
            gl.TRIANGLES,
            0,
            6,
            1,
        );
        expect(gl.drawArrays).not.toHaveBeenCalled();

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("uploads a textured sprite instance and uses the fallback texture", async () => {
        const gl = createFakeWebGl2();
        const { gpuResource, pipelineLibrary, submitter } =
            await createStartedSubmitter();
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

        const report = submitter.submit(frame, createWebGl2Runtime(gl));

        expect(report).toMatchObject({
            result: { status: "submitted" },
            metrics: {
                drawCallCount: 1,
                vertexCount: 6,
                uploadCallCount: 1,
                uploadByteCount: 112,
                uploadRangeCount: 1,
                uploadLayoutCount: 1,
                fallbackResourceCount: 1,
            },
        });
        expect(gl.activeTexture).toHaveBeenCalledWith(gl.TEXTURE0);
        expect(gl.bindTexture).toHaveBeenCalledWith(
            gl.TEXTURE_2D,
            expect.any(Object),
        );
        expect(gl.drawArraysInstanced).toHaveBeenCalledWith(
            gl.TRIANGLES,
            0,
            6,
            1,
        );

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("supplies explicit alpha, target, and camera uniforms for instances", async () => {
        const gl = createFakeWebGl2();
        const { gpuResource, pipelineLibrary, submitter } =
            await createStartedSubmitter();
        const frame = createRender2DPrepare().prepare(
            createInput(
                [
                    {
                        id: "main",
                        order: 0,
                        items: [
                            {
                                kind: "rect",
                                sortKey: 0,
                                x: 5,
                                y: 6,
                                w: 10,
                                h: 10,
                            },
                        ],
                    },
                ],
                {
                    alpha: 0.25,
                    camera: {
                        x: 10,
                        y: 20,
                        zoom: 2,
                        shakeX: 3,
                        shakeY: 4,
                    },
                },
            ),
        );

        submitter.submit(frame, createWebGl2Runtime(gl));

        expect(gl.uniform4f).toHaveBeenCalledWith(
            expect.any(Object),
            0.25,
            100,
            100,
            1,
        );
        expect(gl.uniform4f).toHaveBeenCalledWith(
            expect.any(Object),
            10,
            20,
            2,
            3,
        );
        expect(gl.uniform4f).toHaveBeenCalledWith(expect.any(Object), 4, 0, 0, 0);

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("submits circles through static geometry and compact instances", async () => {
        const gl = createFakeWebGl2();
        const { gpuResource, pipelineLibrary, submitter } =
            await createStartedSubmitter();
        const frame = createRender2DPrepare().prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [
                        {
                            kind: "circle",
                            sortKey: 0,
                            x: 10,
                            y: 10,
                            radius: 5,
                        },
                    ],
                },
            ]),
        );

        const report = submitter.submit(frame, createWebGl2Runtime(gl));

        expect(report).toMatchObject({
            result: { status: "submitted" },
            metrics: {
                drawCallCount: 1,
                vertexCount: 72,
                uploadCallCount: 1,
                uploadByteCount: 88,
                uploadRangeCount: 1,
                uploadLayoutCount: 1,
            },
        });
        expect(gl.bufferSubData).toHaveBeenCalledWith(
            gl.ARRAY_BUFFER,
            0,
            expect.any(Float32Array),
        );
        expect(gl.drawArraysInstanced).toHaveBeenCalledWith(
            gl.TRIANGLES,
            0,
            72,
            1,
        );
        expect(gl.drawArrays).not.toHaveBeenCalled();

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("reuses circle and ellipse static geometry across frames", async () => {
        const gl = createFakeWebGl2();
        const { gpuResource, pipelineLibrary, submitter } =
            await createStartedSubmitter();
        const frame = createRender2DPrepare().prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [
                        {
                            kind: "circle",
                            sortKey: 0,
                            x: 10,
                            y: 10,
                            radius: 5,
                        },
                    ],
                },
            ]),
        );
        const ellipseFrame = createRender2DPrepare().prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [
                        {
                            kind: "ellipse",
                            sortKey: 0,
                            x: 10,
                            y: 10,
                            radiusX: 5,
                            radiusY: 8,
                        },
                    ],
                },
            ]),
        );
        const runtime = createWebGl2Runtime(gl);

        submitter.submit(frame, runtime);
        submitter.submit(ellipseFrame, runtime);

        expect(gl.createBuffer).toHaveBeenCalledTimes(2);
        expect(gl.bufferData).toHaveBeenCalledWith(
            gl.ARRAY_BUFFER,
            expect.any(Float32Array),
            gl.STATIC_DRAW,
        );

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("reuses and invalidates polygon static geometry by local vertex key", async () => {
        const gl = createFakeWebGl2();
        const { gpuResource, pipelineLibrary, submitter } =
            await createStartedSubmitter();
        const runtime = createWebGl2Runtime(gl);
        const createPolygonFrame = (x2: number) =>
            createRender2DPrepare().prepare(
                createInput([
                    {
                        id: "main",
                        order: 0,
                        items: [
                            {
                                kind: "polygon",
                                sortKey: 0,
                                x: 0,
                                y: 0,
                                vertices: [
                                    { x: 0, y: 0 },
                                    { x: x2, y: 0 },
                                    { x: 0, y: 10 },
                                ],
                            },
                        ],
                    },
                ]),
            );

        submitter.submit(createPolygonFrame(10), runtime);
        submitter.submit(createPolygonFrame(10), runtime);
        submitter.submit(createPolygonFrame(20), runtime);

        expect(gl.createBuffer).toHaveBeenCalledTimes(3);
        expect(gl.drawArraysInstanced).toHaveBeenCalledWith(
            gl.TRIANGLES,
            0,
            3,
            1,
        );

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });
});
