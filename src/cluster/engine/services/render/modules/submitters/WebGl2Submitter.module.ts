import type { GfxRuntime } from "../../backend/gfxBackend";
import type { GpuResourceService } from "../../backend/gpuResource";
import type { PipelineLibraryService } from "../../backend/pipelineLibrary";
import type {
    Render2DPreparedBatch,
    Render2DPreparedFrame,
} from "../Render2DPrepare.module";
import type { RenderBlendMode } from "../../service/Render.types";
import type { SubmitFrameMetrics, SubmitFrameReport } from "../SubmitFrame.module";
import {
    BYTES_PER_FLOAT,
    RENDER_2D_VERTEX_LAYOUTS,
    getRender2DPipelineDescriptor,
    writeRender2DBatchVertexData,
    type Render2DVertexLayoutInfo,
} from "./Render2DVertexPacking.module";

export type WebGl2Submitter = Readonly<{
    submit(
        frame: Render2DPreparedFrame,
        runtime: Extract<GfxRuntime, { backend: "webgl2" }>,
    ): SubmitFrameReport;
}>;

export type WebGl2SubmitterConfig = Readonly<{
    gpuResource: GpuResourceService;
    pipelineLibrary: PipelineLibraryService;
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
            attr.offsetFloats * BYTES_PER_FLOAT,
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
    let vertexArena: Float32Array<ArrayBufferLike> = new Float32Array(0);

    function submitWebGl2Batch(
        runtime: Extract<GfxRuntime, { backend: "webgl2" }>,
        frame: Render2DPreparedFrame,
        batch: Render2DPreparedBatch,
    ): BatchSubmitReport {
        const gl = runtime.handle;
        const metrics = createMutableSubmitMetrics();
        const written = writeRender2DBatchVertexData(vertexArena, frame, batch);
        vertexArena = written.data;
        if (written.length === 0) {
            return { result: "submitted", metrics: EMPTY_SUBMIT_METRICS };
        }

        const pipeline = config.pipelineLibrary.getWebGl2Pipeline({
            desc: getRender2DPipelineDescriptor(batch),
            gl,
        });
        if (!pipeline) {
            return { result: "no-submitter", metrics: EMPTY_SUBMIT_METRICS };
        }

        const upload = vertexArena.subarray(0, written.length);
        const vertexBufferHandle = config.gpuResource.createBuffer({
            label: `render.2d.${batch.vertexLayout}.vertices`,
            size: upload.byteLength,
            kind: "vertex",
        });
        config.gpuResource.stageUpload({
            target: vertexBufferHandle,
            byteLength: upload.byteLength,
            data: upload,
            usage: "stream-draw",
        });
        config.gpuResource.flushWebGl2Uploads(gl);

        const vertexBuffer = config.gpuResource.getWebGl2Buffer(
            vertexBufferHandle,
            gl,
        );
        if (!vertexBuffer) {
            return { result: "no-submitter", metrics: EMPTY_SUBMIT_METRICS };
        }

        const layout = RENDER_2D_VERTEX_LAYOUTS[batch.vertexLayout];
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

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            configureVertexLayout(gl, layout);
            vertexLayoutConfigured = true;
            gl.drawArrays(gl.TRIANGLES, 0, written.length / layout.strideFloats);
            metrics.drawCallCount += 1;
            metrics.vertexCount += written.length / layout.strideFloats;
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

            for (let batchIndex = 0; batchIndex < frame.batchCount; batchIndex++) {
                const batch = frame.batches[batchIndex];
                const report = submitWebGl2Batch(runtime, frame, batch);
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
