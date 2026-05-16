import { describe, expect, it } from "vitest";
import type { GfxRuntime } from "../../backend/gfxBackend";
import { createGpuResource } from "../../backend/gpuResource";
import { createPipelineLibrary } from "../../backend/pipelineLibrary";
import type { RenderFrameInput } from "../../service/Render.types";
import { createFakeWebGl2 } from "../../testing/FakeWebGl2.test-utils";
import { createRender2DPrepare } from "../Render2DPrepare.module";
import { createRender2DUpload } from "../Render2DUpload.module";
import { createWebGl2Submitter } from "./WebGl2Submitter.module";

function createInput(layers: RenderFrameInput["layers"]): RenderFrameInput {
    return {
        target: { w: 100, h: 100, dpr: 1 },
        alpha: 1,
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
            render2DUpload: createRender2DUpload(),
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
                uploadByteCount: 56,
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
        expect(gl.vertexAttribDivisor).toHaveBeenCalledWith(6, 1);
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
                uploadByteCount: 72,
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

    it("keeps unsupported primitives on the legacy draw path", async () => {
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
                uploadByteCount: 1728,
                uploadRangeCount: 1,
                uploadLayoutCount: 1,
            },
        });
        expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 72);
        expect(gl.drawArraysInstanced).not.toHaveBeenCalled();

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });
});
