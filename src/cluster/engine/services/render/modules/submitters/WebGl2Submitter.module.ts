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
import {
    getRender2DQuadInstancePipelineDescriptor,
    getRender2DPrimitiveInstancePipelineDescriptor,
    type Render2DInstanceLayoutInfo,
    type Render2DInstanceLayoutKey,
} from "../Render2DInstancePacking.module";
import { getRender2DFrameUniformValues } from "../Render2DFrameUniforms.module";

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

type BatchSubmitResult = "submitted" | "no-submitter";

type BatchSubmitReport = Readonly<{
    result: BatchSubmitResult;
    metrics: SubmitFrameMetrics;
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

function mergeSubmitMetrics(
    target: MutableSubmitMetrics,
    source: SubmitFrameMetrics,
): void {
    target.drawCallCount += source.drawCallCount;
    target.vertexCount += source.vertexCount;
    target.uploadCallCount += source.uploadCallCount;
    target.uploadByteCount += source.uploadByteCount;
    target.uploadRangeCount += source.uploadRangeCount;
    target.uploadLayoutCount += source.uploadLayoutCount;
    target.frameVertexBufferCreateCount += source.frameVertexBufferCreateCount;
    target.frameVertexBufferGrowCount += source.frameVertexBufferGrowCount;
    target.frameVertexBufferReuseCount += source.frameVertexBufferReuseCount;
    target.frameVertexBufferCapacityBytes += source.frameVertexBufferCapacityBytes;
    target.skippedResourceCount += source.skippedResourceCount;
    target.fallbackResourceCount += source.fallbackResourceCount;
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

function configureInstanceLayout(
    gl: WebGL2RenderingContext,
    layout: Render2DInstanceLayoutInfo,
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
        gl.vertexAttribDivisor(attr.location, 1);
    }
}

function disableInstanceLayout(
    gl: WebGL2RenderingContext,
    layout: Render2DInstanceLayoutInfo,
): void {
    for (const attr of layout.attrs) {
        gl.vertexAttribDivisor(attr.location, 0);
        gl.disableVertexAttribArray(attr.location);
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

function configureUnitQuadLayout(
    gl: WebGL2RenderingContext,
    vertexBuffer: WebGLBuffer,
): void {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 2 * BYTES_PER_FLOAT, 0);
    gl.vertexAttribDivisor(0, 0);
}

function configureStaticVec2Layout(
    gl: WebGL2RenderingContext,
    vertexBuffer: WebGLBuffer,
): void {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 2 * BYTES_PER_FLOAT, 0);
    gl.vertexAttribDivisor(0, 0);
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

function isQuadInstanceLayout(layout: Render2DUploadLayoutKey): boolean {
    return (
        layout === "quad-solid-instance-2d" ||
        layout === "quad-textured-instance-2d"
    );
}

function getStaticGeometryForRange(
    gl: WebGL2RenderingContext,
    range: Render2DUploadRange,
    uploadFrame: Render2DUploadFrame,
    gpuResource: GpuResourceService,
): { vertexBuffer: WebGLBuffer; vertexCount: number } | undefined {
    if (range.layout === "line-solid-instance-2d") {
        return gpuResource.getWebGl2UnitLineGeometry(gl);
    }
    if (range.layout === "circle-solid-instance-2d") {
        return gpuResource.getWebGl2UnitCircleGeometry(gl);
    }
    if (range.layout === "polygon-solid-instance-2d") {
        const item = uploadFrame.source.items[range.itemStart];
        if (item.geometry.kind !== "polygon") return undefined;
        return gpuResource.getWebGl2PolygonGeometry({
            key: item.geometry.localGeometryKey,
            vertices: item.geometry.vertices,
            gl,
        });
    }
    return undefined;
}

function bindFrameUniforms(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    frame: Render2DPreparedFrame,
): void {
    const uniforms = getRender2DFrameUniformValues(frame);
    const frameUniform = gl.getUniformLocation(program, "u_frame");
    if (frameUniform) {
        gl.uniform4f(
            frameUniform,
            uniforms.alpha,
            uniforms.targetWidth,
            uniforms.targetHeight,
            uniforms.targetDpr,
        );
    }

    const cameraUniform = gl.getUniformLocation(program, "u_camera");
    if (cameraUniform) {
        gl.uniform4f(
            cameraUniform,
            uniforms.cameraX,
            uniforms.cameraY,
            uniforms.cameraZoom,
            uniforms.cameraShakeX,
        );
    }

    const cameraExtraUniform = gl.getUniformLocation(program, "u_cameraExtra");
    if (cameraExtraUniform) {
        gl.uniform4f(cameraExtraUniform, uniforms.cameraShakeY, 0, 0, 0);
    }
}

export function createWebGl2Submitter(
    config: WebGl2SubmitterConfig,
): WebGl2Submitter {
    const buffersByLayout = new Map<Render2DUploadLayoutKey, WebGLBuffer>();

    function uploadLayout(
        gl: WebGL2RenderingContext,
        upload: Render2DLayoutUpload,
        metrics: MutableSubmitMetrics,
    ): boolean {
        const frameVertexBuffer = config.gpuResource.getWebGl2FrameVertexBuffer({
            layout: upload.layout,
            gl,
            byteLength: upload.byteLength,
        });
        if (!frameVertexBuffer) return false;
        addFrameVertexBufferMetrics(metrics, frameVertexBuffer);

        const data = upload.data.subarray(0, upload.floatLength);
        gl.bindBuffer(gl.ARRAY_BUFFER, frameVertexBuffer.buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
        metrics.uploadCallCount += 1;
        buffersByLayout.set(upload.layout, frameVertexBuffer.buffer);

        return true;
    }

    function uploadLayouts(
        gl: WebGL2RenderingContext,
        uploadFrame: Render2DUploadFrame,
        metrics: MutableSubmitMetrics,
    ): boolean {
        buffersByLayout.clear();
        for (const layoutUpload of uploadFrame.layouts) {
            if (!uploadLayout(gl, layoutUpload, metrics)) {
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
                return false;
            }
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return true;
    }

    function submitWebGl2Range(
        gl: WebGL2RenderingContext,
        batch: Render2DPreparedBatch,
        range: Render2DUploadRange,
        uploadFrame: Render2DUploadFrame,
    ): BatchSubmitReport {
        const metrics = createMutableSubmitMetrics();
        const pipeline = config.pipelineLibrary.getWebGl2Pipeline({
            desc:
                range.kind === "instances"
                    ? isQuadInstanceLayout(range.layout)
                        ? getRender2DQuadInstancePipelineDescriptor(batch)
                        : getRender2DPrimitiveInstancePipelineDescriptor(
                              batch,
                              range.layout as Render2DInstanceLayoutKey,
                          )
                    : getRender2DPipelineDescriptor(batch),
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
        let instanceLayoutConfigured = false;
        let unitQuadLayoutConfigured = false;

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

            if (range.kind === "instances") {
                const staticGeometry = isQuadInstanceLayout(range.layout)
                    ? config.gpuResource.getWebGl2UnitQuadGeometry(gl)
                    : getStaticGeometryForRange(
                          gl,
                          range,
                          uploadFrame,
                          config.gpuResource,
                      );
                if (!staticGeometry) {
                    return {
                        result: "no-submitter",
                        metrics: snapshotSubmitMetrics(metrics),
                    };
                }
                bindFrameUniforms(gl, pipeline.program, uploadFrame.source);
                if (isQuadInstanceLayout(range.layout)) {
                    configureUnitQuadLayout(gl, staticGeometry.vertexBuffer);
                } else {
                    configureStaticVec2Layout(gl, staticGeometry.vertexBuffer);
                }
                unitQuadLayoutConfigured = true;
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                configureInstanceLayout(
                    gl,
                    layout as Render2DInstanceLayoutInfo,
                    range.byteOffset,
                );
                instanceLayoutConfigured = true;
                gl.drawArraysInstanced(
                    gl.TRIANGLES,
                    0,
                    staticGeometry.vertexCount,
                    range.instanceCount,
                );
            } else {
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                configureVertexLayout(
                    gl,
                    layout as Render2DVertexLayoutInfo,
                    range.byteOffset,
                );
                vertexLayoutConfigured = true;
                gl.drawArrays(gl.TRIANGLES, 0, range.vertexCount);
            }
            metrics.drawCallCount += 1;
            metrics.vertexCount += range.vertexCount;
        } finally {
            if (instanceLayoutConfigured) {
                disableInstanceLayout(
                    gl,
                    layout as Render2DInstanceLayoutInfo,
                );
            }
            if (vertexLayoutConfigured) {
                disableVertexLayout(gl, layout as Render2DVertexLayoutInfo);
            }
            if (unitQuadLayoutConfigured) {
                gl.vertexAttribDivisor(0, 0);
                gl.disableVertexAttribArray(0);
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
            addUploadPlannerMetrics(metrics, uploadFrame);
            if (!uploadLayouts(gl, uploadFrame, metrics)) {
                return {
                    result: { status: "skipped", reason: "no-submitter" },
                    metrics: snapshotSubmitMetrics(metrics),
                };
            }

            for (const range of uploadFrame.ranges) {
                const batch = frame.batches[range.batchIndex];
                const report = submitWebGl2Range(gl, batch, range, uploadFrame);
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
