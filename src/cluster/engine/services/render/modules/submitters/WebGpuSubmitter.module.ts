import type { GfxRuntime } from "../../backend/gfxBackend";
import type { GpuResourceService } from "../../backend/gpuResource";
import type { PipelineLibraryService } from "../../backend/pipelineLibrary";
import type {
    Render2DPreparedBatch,
    Render2DPreparedFrame,
} from "../Render2DPrepare.module";
import type { SubmitFrameReport, SubmitFrameMetrics } from "../SubmitFrame.module";
import {
    RENDER_2D_VERTEX_LAYOUTS,
    getRender2DPipelineDescriptor,
    writeRender2DBatchVertexData,
} from "./Render2DVertexPacking.module";

export type WebGpuSubmitter = Readonly<{
    submit(
        frame: Render2DPreparedFrame,
        runtime: Extract<GfxRuntime, { backend: "webgpu" }>,
    ): SubmitFrameReport;
}>;

export type WebGpuSubmitterConfig = Readonly<{
    gpuResource: GpuResourceService;
    pipelineLibrary: PipelineLibraryService;
}>;

type MutableSubmitMetrics = {
    drawCallCount: number;
    vertexCount: number;
    skippedResourceCount: number;
    fallbackResourceCount: number;
};

type WebGpuRenderPassEncoderLike = Readonly<{
    setPipeline(pipeline: object): void;
    setVertexBuffer(slot: number, buffer: object): void;
    setBindGroup(index: number, bindGroup: object): void;
    draw(vertexCount: number): void;
    end(): void;
}>;

type WebGpuCommandEncoderLike = Readonly<{
    beginRenderPass(desc: object): WebGpuRenderPassEncoderLike;
    finish(): object;
}>;

const EMPTY_SUBMIT_METRICS: SubmitFrameMetrics = Object.freeze({
    drawCallCount: 0,
    vertexCount: 0,
    skippedResourceCount: 0,
    fallbackResourceCount: 0,
});

function createMutableSubmitMetrics(): MutableSubmitMetrics {
    return {
        drawCallCount: 0,
        vertexCount: 0,
        skippedResourceCount: 0,
        fallbackResourceCount: 0,
    };
}

function snapshotSubmitMetrics(
    metrics: MutableSubmitMetrics,
): SubmitFrameMetrics {
    return {
        drawCallCount: metrics.drawCallCount,
        vertexCount: metrics.vertexCount,
        skippedResourceCount: metrics.skippedResourceCount,
        fallbackResourceCount: metrics.fallbackResourceCount,
    };
}

function getOrCreateArena(
    arenas: Map<Render2DPreparedBatch["vertexLayout"], Float32Array<ArrayBufferLike>>,
    layout: Render2DPreparedBatch["vertexLayout"],
): Float32Array<ArrayBufferLike> {
    const arena = arenas.get(layout);
    if (arena) return arena;
    const next = new Float32Array(0);
    arenas.set(layout, next);
    return next;
}

function createRenderPass(
    runtime: Extract<GfxRuntime, { backend: "webgpu" }>,
): {
    encoder: WebGpuCommandEncoderLike;
    pass: WebGpuRenderPassEncoderLike;
} | undefined {
    try {
        const currentTexture = runtime.context.getCurrentTexture();
        const encoder = runtime.device.createCommandEncoder({
            label: "render.2d.webgpu.encoder",
        }) as WebGpuCommandEncoderLike;
        const pass = encoder.beginRenderPass({
            label: "render.2d.webgpu.pass",
            colorAttachments: [
                {
                    view: currentTexture.createView(),
                    clearValue: { r: 0.04, g: 0.05, b: 0.08, a: 1 },
                    loadOp: "clear",
                    storeOp: "store",
                },
            ],
        });
        return { encoder, pass };
    } catch {
        return undefined;
    }
}

export function createWebGpuSubmitter(
    config: WebGpuSubmitterConfig,
): WebGpuSubmitter {
    const vertexArenas = new Map<
        Render2DPreparedBatch["vertexLayout"],
        Float32Array<ArrayBufferLike>
    >();

    function submitWebGpuBatch(
        runtime: Extract<GfxRuntime, { backend: "webgpu" }>,
        frame: Render2DPreparedFrame,
        batch: Render2DPreparedBatch,
        pass: WebGpuRenderPassEncoderLike,
        metrics: MutableSubmitMetrics,
    ): boolean {
        const arena = getOrCreateArena(vertexArenas, batch.vertexLayout);
        const written = writeRender2DBatchVertexData(arena, frame, batch);
        vertexArenas.set(batch.vertexLayout, written.data);
        if (written.length === 0) return true;

        const pipeline = config.pipelineLibrary.getWebGpuPipeline({
            desc: getRender2DPipelineDescriptor(batch),
            device: runtime.device,
            format: runtime.format,
        });
        if (!pipeline) return false;

        const layout = RENDER_2D_VERTEX_LAYOUTS[batch.vertexLayout];
        const upload = written.data.subarray(0, written.length);
        const vertexBuffer = config.gpuResource.getWebGpuFrameVertexBuffer({
            layout: batch.vertexLayout,
            device: runtime.device,
            byteLength: upload.byteLength,
        });
        if (!vertexBuffer) return false;

        let bindGroup: object | undefined;
        if (batch.pipelineFamily === "textured-2d") {
            const binding = config.gpuResource.resolveWebGpuTexture({
                resourceId: batch.resourceId,
                device: runtime.device,
                bindGroupLayout: pipeline.pipeline.getBindGroupLayout(0),
            });
            if (!binding?.bindGroup) {
                metrics.skippedResourceCount += 1;
                return false;
            }
            if (binding.fallback) metrics.fallbackResourceCount += 1;
            bindGroup = binding.bindGroup;
        }

        try {
            runtime.device.queue.writeBuffer(vertexBuffer.buffer, 0, upload);
            pass.setPipeline(pipeline.pipeline);
            pass.setVertexBuffer(0, vertexBuffer.buffer);
            if (bindGroup) pass.setBindGroup(0, bindGroup);
            pass.draw(written.length / layout.strideFloats);
        } catch {
            return false;
        }

        metrics.drawCallCount += 1;
        metrics.vertexCount += written.length / layout.strideFloats;
        return true;
    }

    return Object.freeze({
        submit(
            frame: Render2DPreparedFrame,
            runtime: Extract<GfxRuntime, { backend: "webgpu" }>,
        ): SubmitFrameReport {
            const renderPass = createRenderPass(runtime);
            if (!renderPass) {
                return {
                    result: { status: "skipped", reason: "no-submitter" },
                    metrics: EMPTY_SUBMIT_METRICS,
                };
            }

            const metrics = createMutableSubmitMetrics();
            config.gpuResource.beginFrame();
            config.gpuResource.flushWebGpuUploads(runtime.device);

            try {
                for (let batchIndex = 0; batchIndex < frame.batchCount; batchIndex++) {
                    const batch = frame.batches[batchIndex];
                    if (
                        !submitWebGpuBatch(
                            runtime,
                            frame,
                            batch,
                            renderPass.pass,
                            metrics,
                        )
                    ) {
                        renderPass.pass.end();
                        return {
                            result: { status: "skipped", reason: "no-submitter" },
                            metrics: snapshotSubmitMetrics(metrics),
                        };
                    }
                }

                renderPass.pass.end();
                runtime.device.queue.submit([renderPass.encoder.finish()]);
            } catch {
                return {
                    result: { status: "skipped", reason: "no-submitter" },
                    metrics: snapshotSubmitMetrics(metrics),
                };
            }

            return {
                result: { status: "submitted" },
                metrics: snapshotSubmitMetrics(metrics),
            };
        },
    });
}
