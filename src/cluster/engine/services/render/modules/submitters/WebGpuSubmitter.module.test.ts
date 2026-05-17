import { describe, expect, it } from "vitest";
import { createGpuResource } from "../../backend/gpuResource";
import { createPipelineLibrary } from "../../backend/pipelineLibrary";
import { createFakeWebGpu } from "../../testing/FakeWebGl2.test-utils";
import { createRender2DPrepare } from "../Render2DPrepare.module";
import { createRender2DUpload } from "../Render2DUpload.module";
import { createWebGpuSubmitter } from "./WebGpuSubmitter.module";
import type { GfxRuntime } from "../../backend/gfxBackend";
import type { RenderFrameInput } from "../../service/Render.types";

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

function createWebGpuRuntime(
    webGpu = createFakeWebGpu(),
): Extract<GfxRuntime, { backend: "webgpu" }> {
    return {
        backend: "webgpu",
        caps: {},
        adapter: webGpu.adapter,
        device: webGpu.device,
        context: webGpu.context,
        format: "bgra8unorm",
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
        submitter: createWebGpuSubmitter({
            gpuResource,
            pipelineLibrary,
            render2DUpload: createRender2DUpload(),
        }),
    };
}

describe("createWebGpuSubmitter", () => {
    it("clears and submits an empty prepared frame", async () => {
        const webGpu = createFakeWebGpu();
        const { gpuResource, pipelineLibrary, submitter } =
            await createStartedSubmitter();
        const frame = createRender2DPrepare().prepare(createInput([]));

        expect(submitter.submit(frame, createWebGpuRuntime(webGpu))).toEqual({
            result: { status: "submitted" },
            metrics: {
                drawCallCount: 0,
                vertexCount: 0,
                uploadCallCount: 0,
                uploadByteCount: 0,
                uploadRangeCount: 0,
                uploadLayoutCount: 0,
                frameVertexBufferCreateCount: 0,
                frameVertexBufferGrowCount: 0,
                frameVertexBufferReuseCount: 0,
                frameVertexBufferCapacityBytes: 0,
                skippedResourceCount: 0,
                fallbackResourceCount: 0,
            },
        });
        expect(webGpu.commandEncoder.beginRenderPass).toHaveBeenCalledWith(
            expect.objectContaining({
                colorAttachments: [
                    expect.objectContaining({
                        loadOp: "clear",
                        storeOp: "store",
                    }),
                ],
            }),
        );
        expect(webGpu.device.queue.submit).toHaveBeenCalledWith([
            expect.any(Object),
        ]);

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("uploads a solid rect instance, binds static geometry, and draws one instance", async () => {
        const webGpu = createFakeWebGpu();
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

        const report = submitter.submit(frame, createWebGpuRuntime(webGpu));

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
        expect(webGpu.device.createBuffer).toHaveBeenCalledTimes(4);
        expect(webGpu.device.queue.writeBuffer).toHaveBeenCalledWith(
            expect.any(Object),
            0,
            expect.any(Float32Array),
        );
        expect(webGpu.renderPass.setBindGroup).toHaveBeenCalledWith(
            0,
            expect.any(Object),
        );
        expect(webGpu.renderPass.setVertexBuffer).toHaveBeenNthCalledWith(
            1,
            0,
            expect.any(Object),
            0,
        );
        expect(webGpu.renderPass.setVertexBuffer).toHaveBeenNthCalledWith(
            2,
            1,
            expect.any(Object),
            0,
        );
        expect(webGpu.renderPass.draw).toHaveBeenCalledWith(6, 1);

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("uses fallback texture and records fallback metrics for missing sprites", async () => {
        const webGpu = createFakeWebGpu();
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

        const report = submitter.submit(frame, createWebGpuRuntime(webGpu));

        expect(report).toMatchObject({
            result: { status: "submitted" },
            metrics: {
                drawCallCount: 1,
                vertexCount: 6,
                fallbackResourceCount: 1,
            },
        });
        expect(webGpu.device.createTexture).toHaveBeenCalledWith(
            expect.objectContaining({
                label: "render.fallbackTexture",
                format: "rgba8unorm",
            }),
        );
        expect(webGpu.renderPass.setBindGroup).toHaveBeenCalledWith(
            0,
            expect.any(Object),
        );
        expect(webGpu.renderPass.setBindGroup).toHaveBeenCalledWith(
            1,
            expect.any(Object),
        );

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("reuses WebGPU frame vertex buffers for unchanged demand", async () => {
        const webGpu = createFakeWebGpu();
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
        const runtime = createWebGpuRuntime(webGpu);

        submitter.submit(frame, runtime);
        const second = submitter.submit(frame, runtime);

        expect(webGpu.device.createBuffer).toHaveBeenCalledTimes(4);
        expect(webGpu.device.queue.writeBuffer).toHaveBeenCalledTimes(6);
        expect(second.metrics).toMatchObject({
            frameVertexBufferCreateCount: 0,
            frameVertexBufferGrowCount: 0,
            frameVertexBufferReuseCount: 1,
            frameVertexBufferCapacityBytes: 256,
        });

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("reports frame vertex buffer growth when upload demand increases", async () => {
        const webGpu = createFakeWebGpu();
        const { gpuResource, pipelineLibrary, submitter } =
            await createStartedSubmitter();
        const runtime = createWebGpuRuntime(webGpu);
        const smallFrame = createRender2DPrepare().prepare(
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
        const largerFrame = createRender2DPrepare().prepare(
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
                            kind: "rect",
                            sortKey: 1,
                            x: 20,
                            y: 20,
                            w: 10,
                            h: 10,
                        },
                        {
                            kind: "rect",
                            sortKey: 2,
                            x: 40,
                            y: 40,
                            w: 10,
                            h: 10,
                        },
                        {
                            kind: "rect",
                            sortKey: 3,
                            x: 60,
                            y: 60,
                            w: 10,
                            h: 10,
                        },
                        {
                            kind: "rect",
                            sortKey: 4,
                            x: 80,
                            y: 80,
                            w: 10,
                            h: 10,
                        },
                    ],
                },
            ]),
        );

        submitter.submit(smallFrame, runtime);
        const grown = submitter.submit(largerFrame, runtime);

        expect(grown.metrics).toMatchObject({
            uploadCallCount: 1,
            uploadByteCount: 480,
            frameVertexBufferCreateCount: 0,
            frameVertexBufferGrowCount: 1,
            frameVertexBufferReuseCount: 0,
            frameVertexBufferCapacityBytes: 512,
        });

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("uploads shared layout buffers and draws batches from byte offsets", async () => {
        const webGpu = createFakeWebGpu();
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
                        {
                            kind: "sprite",
                            sortKey: 1,
                            x: 0,
                            y: 0,
                            w: 10,
                            h: 10,
                            resourceId: "missing.sprite",
                        },
                        {
                            kind: "rect",
                            sortKey: 2,
                            x: 20,
                            y: 20,
                            w: 10,
                            h: 10,
                            blend: "alpha",
                        },
                    ],
                },
            ]),
        );

        const report = submitter.submit(frame, createWebGpuRuntime(webGpu));

        expect(report).toMatchObject({
            result: { status: "submitted" },
            metrics: {
                drawCallCount: 3,
                vertexCount: 18,
                uploadCallCount: 2,
                uploadByteCount: 304,
                uploadRangeCount: 3,
                uploadLayoutCount: 2,
                frameVertexBufferCreateCount: 2,
                frameVertexBufferGrowCount: 0,
                frameVertexBufferReuseCount: 0,
                frameVertexBufferCapacityBytes: 512,
                fallbackResourceCount: 1,
            },
        });
        expect(webGpu.device.queue.writeBuffer).toHaveBeenCalledTimes(5);
        expect(webGpu.renderPass.setVertexBuffer).toHaveBeenNthCalledWith(
            1,
            0,
            expect.any(Object),
            0,
        );
        expect(webGpu.renderPass.setVertexBuffer).toHaveBeenNthCalledWith(
            2,
            1,
            expect.any(Object),
            0,
        );
        expect(webGpu.renderPass.setVertexBuffer).toHaveBeenNthCalledWith(
            3,
            0,
            expect.any(Object),
            0,
        );
        expect(webGpu.renderPass.setVertexBuffer).toHaveBeenNthCalledWith(
            4,
            1,
            expect.any(Object),
            0,
        );
        expect(webGpu.renderPass.setVertexBuffer).toHaveBeenNthCalledWith(
            5,
            0,
            expect.any(Object),
            0,
        );
        expect(webGpu.renderPass.setVertexBuffer).toHaveBeenNthCalledWith(
            6,
            1,
            expect.any(Object),
            96,
        );
        expect(webGpu.renderPass.draw).toHaveBeenNthCalledWith(1, 6, 1);
        expect(webGpu.renderPass.draw).toHaveBeenNthCalledWith(2, 6, 1);
        expect(webGpu.renderPass.draw).toHaveBeenNthCalledWith(3, 6, 1);

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("skips when a WebGPU pipeline cannot be created", async () => {
        const webGpu = createFakeWebGpu();
        webGpu.device.createRenderPipeline.mockImplementationOnce(() => {
            throw new Error("pipeline failed");
        });
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

        expect(submitter.submit(frame, createWebGpuRuntime(webGpu))).toEqual({
            result: { status: "skipped", reason: "no-submitter" },
            metrics: {
                drawCallCount: 0,
                vertexCount: 0,
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
        expect(webGpu.renderPass.draw).not.toHaveBeenCalled();

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });

    it("uploads default and explicit frame uniform data", async () => {
        const webGpu = createFakeWebGpu();
        const { gpuResource, pipelineLibrary, submitter } =
            await createStartedSubmitter();
        const defaultFrame = createRender2DPrepare().prepare(
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
        const explicitFrame = createRender2DPrepare().prepare(
            createInput(
                [
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
                {
                    alpha: 0.5,
                    camera: {
                        x: 7,
                        y: 8,
                        zoom: 1.5,
                        shakeX: 2,
                        shakeY: 3,
                    },
                },
            ),
        );
        const runtime = createWebGpuRuntime(webGpu);

        submitter.submit(defaultFrame, runtime);
        submitter.submit(explicitFrame, runtime);

        const uniformWrites = webGpu.device.queue.writeBuffer.mock.calls
            .map((call) => call[2])
            .filter(
                (data): data is Float32Array =>
                    data instanceof Float32Array &&
                    data.length === 12 &&
                    data[1] === 100,
            );
        expect(Array.from(uniformWrites[0].subarray(0, 9))).toEqual([
            1, 100, 100, 1, 0, 0, 1, 0, 0,
        ]);
        expect(Array.from(uniformWrites[1].subarray(0, 9))).toEqual([
            0.5, 100, 100, 1, 7, 8, 1.5, 2, 3,
        ]);

        await pipelineLibrary.dispose();
        await gpuResource.dispose();
    });
});
