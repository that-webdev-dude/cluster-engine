import type { GfxRuntime } from "../../backend/gfxBackend";
import type { GpuResourceService } from "../../backend/gpuResource";
import type { PipelineLibraryService } from "../../backend/pipelineLibrary";
import type {
    Render2DPreparedBatch,
    Render2DPreparedFrame,
} from "../Render2DPrepare.module";
import type {
    Render2DLayoutUpload,
    Render2DUpload,
    Render2DUploadFrame,
    Render2DUploadLayoutKey,
    Render2DUploadRange,
} from "../Render2DUpload.module";
import type {
    SubmitFrameReport,
    SubmitFrameMetrics,
} from "../SubmitFrame.module";
import { getRender2DPipelineDescriptor } from "../Render2DVertexPacking.module";

export type WebGpuSubmitter = Readonly<{
    submit(
        frame: Render2DPreparedFrame,
        runtime: Extract<GfxRuntime, { backend: "webgpu" }>,
    ): SubmitFrameReport;
}>;

export type WebGpuSubmitterConfig = Readonly<{
    gpuResource: GpuResourceService;
    pipelineLibrary: PipelineLibraryService;
    render2DUpload: Render2DUpload;
}>;

type MutableSubmitMetrics = {
    drawCallCount: number;
    vertexCount: number;
    uploadCallCount: number;
    uploadByteCount: number;
    uploadRangeCount: number;
    uploadLayoutCount: number;
    frameVertexBufferCreateCount: number;
    frameVertexBufferGrowCount: number;
    frameVertexBufferReuseCount: number;
    frameVertexBufferCapacityBytes: number;
    skippedResourceCount: number;
    fallbackResourceCount: number;
};

type WebGpuRenderPassEncoderLike = Readonly<{
    setPipeline(pipeline: object): void;
    setVertexBuffer(slot: number, buffer: object, offset?: number): void;
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
});

function createMutableSubmitMetrics(): MutableSubmitMetrics {
    return {
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
    };
}

function snapshotSubmitMetrics(
    metrics: MutableSubmitMetrics,
): SubmitFrameMetrics {
    return {
        drawCallCount: metrics.drawCallCount,
        vertexCount: metrics.vertexCount,
        uploadCallCount: metrics.uploadCallCount,
        uploadByteCount: metrics.uploadByteCount,
        uploadRangeCount: metrics.uploadRangeCount,
        uploadLayoutCount: metrics.uploadLayoutCount,
        frameVertexBufferCreateCount: metrics.frameVertexBufferCreateCount,
        frameVertexBufferGrowCount: metrics.frameVertexBufferGrowCount,
        frameVertexBufferReuseCount: metrics.frameVertexBufferReuseCount,
        frameVertexBufferCapacityBytes: metrics.frameVertexBufferCapacityBytes,
        skippedResourceCount: metrics.skippedResourceCount,
        fallbackResourceCount: metrics.fallbackResourceCount,
    };
}

function addUploadPlannerMetrics(
    metrics: MutableSubmitMetrics,
    uploadFrame: Render2DUploadFrame,
): void {
    metrics.uploadByteCount += uploadFrame.stats.uploadByteLength;
    metrics.uploadRangeCount += uploadFrame.stats.rangeCount;
    metrics.uploadLayoutCount += uploadFrame.stats.layoutUploadCount;
}

function addFrameVertexBufferMetrics(
    metrics: MutableSubmitMetrics,
    buffer: { readonly capacityBytes: number; readonly status: string },
): void {
    metrics.frameVertexBufferCapacityBytes += buffer.capacityBytes;
    if (buffer.status === "reused") {
        metrics.frameVertexBufferReuseCount += 1;
        return;
    }
    if (buffer.status === "grown") {
        metrics.frameVertexBufferGrowCount += 1;
        return;
    }
    metrics.frameVertexBufferCreateCount += 1;
}

function createRenderPass(runtime: Extract<GfxRuntime, { backend: "webgpu" }>):
    | {
          encoder: WebGpuCommandEncoderLike;
          pass: WebGpuRenderPassEncoderLike;
      }
    | undefined {
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
    const buffersByLayout = new Map<Render2DUploadLayoutKey, object>();

    function uploadLayout(
        runtime: Extract<GfxRuntime, { backend: "webgpu" }>,
        upload: Render2DLayoutUpload,
        metrics: MutableSubmitMetrics,
    ): boolean {
        const vertexBuffer = config.gpuResource.getWebGpuFrameVertexBuffer({
            layout: upload.layout,
            device: runtime.device,
            byteLength: upload.byteLength,
        });
        if (!vertexBuffer) return false;
        addFrameVertexBufferMetrics(metrics, vertexBuffer);

        const data = upload.data.subarray(0, upload.floatLength);
        try {
            runtime.device.queue.writeBuffer(vertexBuffer.buffer, 0, data);
            metrics.uploadCallCount += 1;
        } catch {
            return false;
        }

        buffersByLayout.set(upload.layout, vertexBuffer.buffer);
        return true;
    }

    function uploadLayouts(
        runtime: Extract<GfxRuntime, { backend: "webgpu" }>,
        uploadFrame: Render2DUploadFrame,
        metrics: MutableSubmitMetrics,
    ): boolean {
        buffersByLayout.clear();
        for (const layoutUpload of uploadFrame.layouts) {
            if (!uploadLayout(runtime, layoutUpload, metrics)) return false;
        }
        return true;
    }

    function submitWebGpuBatch(
        runtime: Extract<GfxRuntime, { backend: "webgpu" }>,
        batch: Render2DPreparedBatch,
        range: Render2DUploadRange,
        pass: WebGpuRenderPassEncoderLike,
        metrics: MutableSubmitMetrics,
    ): boolean {
        const pipeline = config.pipelineLibrary.getWebGpuPipeline({
            desc: getRender2DPipelineDescriptor(batch),
            device: runtime.device,
            format: runtime.format,
        });
        if (!pipeline) return false;

        const vertexBuffer = buffersByLayout.get(range.layout);
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
            pass.setPipeline(pipeline.pipeline);
            pass.setVertexBuffer(0, vertexBuffer, range.byteOffset);
            if (bindGroup) pass.setBindGroup(0, bindGroup);
            pass.draw(range.vertexCount);
        } catch {
            return false;
        }

        metrics.drawCallCount += 1;
        metrics.vertexCount += range.vertexCount;
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
                const uploadFrame = config.render2DUpload.build(frame);
                addUploadPlannerMetrics(metrics, uploadFrame);
                if (!uploadLayouts(runtime, uploadFrame, metrics)) {
                    renderPass.pass.end();
                    return {
                        result: { status: "skipped", reason: "no-submitter" },
                        metrics: snapshotSubmitMetrics(metrics),
                    };
                }

                for (
                    let batchIndex = 0;
                    batchIndex < frame.batchCount;
                    batchIndex++
                ) {
                    const batch = frame.batches[batchIndex];
                    const range = uploadFrame.rangesByBatchIndex[batchIndex];
                    if (!range) continue;
                    if (
                        !submitWebGpuBatch(
                            runtime,
                            batch,
                            range,
                            renderPass.pass,
                            metrics,
                        )
                    ) {
                        renderPass.pass.end();
                        return {
                            result: {
                                status: "skipped",
                                reason: "no-submitter",
                            },
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
