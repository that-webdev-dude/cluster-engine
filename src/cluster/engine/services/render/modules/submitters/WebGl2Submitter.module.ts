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
import type { RenderBlendMode } from "../../service/Render.types";
import type {
    SubmitFrameMetrics,
    SubmitFrameReport,
} from "../SubmitFrame.module";
import {
    BYTES_PER_FLOAT,
    getRender2DPipelineDescriptor,
    type Render2DVertexLayoutInfo,
} from "../Render2DVertexPacking.module";

export type WebGl2Submitter = Readonly<{
    submit(
        frame: Render2DPreparedFrame,
        runtime: Extract<GfxRuntime, { backend: "webgl2" }>,
    ): SubmitFrameReport;
}>;

export type WebGl2SubmitterConfig = Readonly<{
    gpuResource: GpuResourceService;
    pipelineLibrary: PipelineLibraryService;
    render2DUpload: Render2DUpload;
}>;

type MutableSubmitMetrics = {
    drawCallCount: number;
    vertexCount: number;
    skippedResourceCount: number;
    fallbackResourceCount: number;
};

type BatchSubmitResult = "submitted" | "no-submitter";

type BatchSubmitReport = Readonly<{
    result: BatchSubmitResult;
    metrics: SubmitFrameMetrics;
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

function mergeSubmitMetrics(
    target: MutableSubmitMetrics,
    source: SubmitFrameMetrics,
): void {
    target.drawCallCount += source.drawCallCount;
    target.vertexCount += source.vertexCount;
    target.skippedResourceCount += source.skippedResourceCount;
    target.fallbackResourceCount += source.fallbackResourceCount;
}

function applyBlendMode(
    gl: WebGL2RenderingContext,
    blendMode: RenderBlendMode,
): void {
    if (blendMode === "alpha") {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        return;
    }
    gl.disable(gl.BLEND);
}

function configureVertexLayout(
    gl: WebGL2RenderingContext,
    layout: Render2DVertexLayoutInfo,
    baseByteOffset: number,
): void {
    const strideBytes = layout.strideFloats * BYTES_PER_FLOAT;

    for (const attr of layout.attrs) {
        gl.enableVertexAttribArray(attr.location);
        gl.vertexAttribPointer(
            attr.location,
            attr.size,
            gl.FLOAT,
            false,
            strideBytes,
            baseByteOffset + attr.offsetFloats * BYTES_PER_FLOAT,
        );
    }
}

function disableVertexLayout(
    gl: WebGL2RenderingContext,
    layout: Render2DVertexLayoutInfo,
): void {
    for (const attr of layout.attrs) {
        gl.disableVertexAttribArray(attr.location);
    }
}

function bindTexturedBatch(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    batch: Render2DPreparedBatch,
    gpuResource: GpuResourceService,
    metrics: MutableSubmitMetrics,
): boolean {
    if (batch.pipelineFamily !== "textured-2d") return true;

    const binding = gpuResource.resolveWebGl2Texture(batch.resourceId, gl);
    if (!binding) {
        metrics.skippedResourceCount += 1;
        return false;
    }
    if (binding.fallback) metrics.fallbackResourceCount += 1;

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, binding.texture);
    gl.bindSampler(0, binding.sampler ?? null);

    const textureUniform = gl.getUniformLocation(program, "u_texture");
    if (textureUniform) {
        gl.uniform1i(textureUniform, 0);
    }

    return true;
}

export function createWebGl2Submitter(
    config: WebGl2SubmitterConfig,
): WebGl2Submitter {
    const buffersByLayout = new Map<Render2DUploadLayoutKey, WebGLBuffer>();

    function uploadLayout(
        gl: WebGL2RenderingContext,
        upload: Render2DLayoutUpload,
    ): boolean {
        const frameVertexBuffer = config.gpuResource.getWebGl2FrameVertexBuffer({
            layout: upload.layout,
            gl,
            byteLength: upload.byteLength,
        });
        if (!frameVertexBuffer) return false;

        const data = upload.data.subarray(0, upload.floatLength);
        gl.bindBuffer(gl.ARRAY_BUFFER, frameVertexBuffer.buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
        buffersByLayout.set(upload.layout, frameVertexBuffer.buffer);

        return true;
    }

    function uploadLayouts(
        gl: WebGL2RenderingContext,
        uploadFrame: Render2DUploadFrame,
    ): boolean {
        buffersByLayout.clear();
        for (const layoutUpload of uploadFrame.layouts) {
            if (!uploadLayout(gl, layoutUpload)) {
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
                return false;
            }
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return true;
    }

    function submitWebGl2Batch(
        gl: WebGL2RenderingContext,
        batch: Render2DPreparedBatch,
        range: Render2DUploadRange,
        uploadFrame: Render2DUploadFrame,
    ): BatchSubmitReport {
        const metrics = createMutableSubmitMetrics();
        const pipeline = config.pipelineLibrary.getWebGl2Pipeline({
            desc: getRender2DPipelineDescriptor(batch),
            gl,
        });
        if (!pipeline) return { result: "no-submitter", metrics: EMPTY_SUBMIT_METRICS };

        const buffer = buffersByLayout.get(range.layout);
        if (!buffer) return { result: "no-submitter", metrics: EMPTY_SUBMIT_METRICS };

        const layout = uploadFrame.layouts.find(
            (layoutUpload) => layoutUpload.layout === range.layout,
        )?.layoutInfo;
        if (!layout) return { result: "no-submitter", metrics: EMPTY_SUBMIT_METRICS };

        let vertexLayoutConfigured = false;

        applyBlendMode(gl, batch.blendMode);
        gl.useProgram(pipeline.program);

        try {
            if (
                !bindTexturedBatch(
                    gl,
                    pipeline.program,
                    batch,
                    config.gpuResource,
                    metrics,
                )
            ) {
                return {
                    result: "no-submitter",
                    metrics: snapshotSubmitMetrics(metrics),
                };
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            configureVertexLayout(gl, layout, range.byteOffset);
            vertexLayoutConfigured = true;
            gl.drawArrays(gl.TRIANGLES, 0, range.vertexCount);
            metrics.drawCallCount += 1;
            metrics.vertexCount += range.vertexCount;
        } finally {
            if (vertexLayoutConfigured) {
                disableVertexLayout(gl, layout);
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            if (batch.pipelineFamily === "textured-2d") {
                gl.bindSampler(0, null);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
            gl.useProgram(null);
        }

        return { result: "submitted", metrics: snapshotSubmitMetrics(metrics) };
    }

    return Object.freeze({
        submit(
            frame: Render2DPreparedFrame,
            runtime: Extract<GfxRuntime, { backend: "webgl2" }>,
        ): SubmitFrameReport {
            const gl = runtime.handle;
            const metrics = createMutableSubmitMetrics();
            gl.viewport(0, 0, frame.target.w, frame.target.h);
            gl.clearColor(0.04, 0.05, 0.08, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            config.gpuResource.beginFrame();

            if (frame.batchCount === 0) {
                return {
                    result: { status: "submitted" },
                    metrics: EMPTY_SUBMIT_METRICS,
                };
            }

            const uploadFrame = config.render2DUpload.build(frame);
            if (!uploadLayouts(gl, uploadFrame)) {
                return {
                    result: { status: "skipped", reason: "no-submitter" },
                    metrics: EMPTY_SUBMIT_METRICS,
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
                const report = submitWebGl2Batch(gl, batch, range, uploadFrame);
                mergeSubmitMetrics(metrics, report.metrics);
                if (report.result === "no-submitter") {
                    return {
                        result: { status: "skipped", reason: "no-submitter" },
                        metrics: snapshotSubmitMetrics(metrics),
                    };
                }
            }

            return {
                result: { status: "submitted" },
                metrics: snapshotSubmitMetrics(metrics),
            };
        },
    });
}
