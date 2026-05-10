import type { GfxRuntime } from "../../gfxBackend";
import type { GpuResourceService } from "../../gpuResource";
import type { PipelineDescriptor, PipelineLibraryService } from "../../pipelineLibrary";
import type {
    Render2DPreparedBatch,
    Render2DPreparedFrame,
    Render2DPreparedItem,
    RenderPreparedColor,
} from "../Render2DPrepare.module";
import type {
    RenderBlendMode,
    RenderItem2D,
    RenderTargetInfo,
} from "../../service/Render.types";
import type { SubmitFrameMetrics, SubmitFrameReport } from "../SubmitFrame.module";

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

type WebGl2VertexLayout = Readonly<{
    strideFloats: number;
    attrs: readonly {
        location: number;
        size: number;
        offsetFloats: number;
    }[];
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

const BYTES_PER_FLOAT = Float32Array.BYTES_PER_ELEMENT;
const SOLID_2D_STRIDE_FLOATS = 6;
const TEXTURED_2D_STRIDE_FLOATS = 8;
const EMPTY_SUBMIT_METRICS: SubmitFrameMetrics = Object.freeze({
    drawCallCount: 0,
    vertexCount: 0,
    skippedResourceCount: 0,
    fallbackResourceCount: 0,
});

const WEBGL2_VERTEX_LAYOUTS: Record<
    Render2DPreparedItem["vertexLayout"],
    WebGl2VertexLayout
> = {
    "position-color-2d": {
        strideFloats: SOLID_2D_STRIDE_FLOATS,
        attrs: [
            { location: 0, size: 2, offsetFloats: 0 },
            { location: 1, size: 4, offsetFloats: 2 },
        ],
    },
    "position-uv-tint-2d": {
        strideFloats: TEXTURED_2D_STRIDE_FLOATS,
        attrs: [
            { location: 0, size: 2, offsetFloats: 0 },
            { location: 1, size: 2, offsetFloats: 2 },
            { location: 2, size: 4, offsetFloats: 4 },
        ],
    },
};

const SOLID_VERTEX_SHADER = `#version 300 es
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec4 a_color;
out vec4 v_color;
void main() {
    v_color = a_color;
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const SOLID_FRAGMENT_SHADER = `#version 300 es
precision mediump float;
in vec4 v_color;
out vec4 outColor;
void main() {
    outColor = v_color;
}`;

const TEXTURED_VERTEX_SHADER = `#version 300 es
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_uv;
layout(location = 2) in vec4 a_tint;
out vec2 v_uv;
out vec4 v_tint;
void main() {
    v_uv = a_uv;
    v_tint = a_tint;
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const TEXTURED_FRAGMENT_SHADER = `#version 300 es
precision mediump float;
uniform sampler2D u_texture;
in vec2 v_uv;
in vec4 v_tint;
out vec4 outColor;
void main() {
    outColor = texture(u_texture, v_uv) * v_tint;
}`;

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

function getPipelineDescriptor(batch: Render2DPreparedBatch): PipelineDescriptor {
    if (batch.pipelineFamily === "textured-2d") {
        return {
            key: `render.webgl2.2d.textured.${batch.blendMode}`,
            pass: batch.layerId,
            primitive: "triangles",
            blend: batch.blendMode,
            layoutKey: "position-uv-tint-2d",
            shader: {
                vertex: TEXTURED_VERTEX_SHADER,
                fragment: TEXTURED_FRAGMENT_SHADER,
            },
        };
    }

    return {
        key: `render.webgl2.2d.solid.${batch.blendMode}`,
        pass: batch.layerId,
        primitive: "triangles",
        blend: batch.blendMode,
        layoutKey: "position-color-2d",
        shader: {
            vertex: SOLID_VERTEX_SHADER,
            fragment: SOLID_FRAGMENT_SHADER,
        },
    };
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
    layout: WebGl2VertexLayout,
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
    layout: WebGl2VertexLayout,
): void {
    for (const attr of layout.attrs) {
        gl.disableVertexAttribArray(attr.location);
    }
}

function toClipX(target: RenderTargetInfo, x: number): number {
    return (x / target.w) * 2 - 1;
}

function toClipY(target: RenderTargetInfo, y: number): number {
    return 1 - (y / target.h) * 2;
}

function writeSolidVertex(
    data: Float32Array,
    offset: number,
    target: RenderTargetInfo,
    x: number,
    y: number,
    color: RenderPreparedColor,
): number {
    data[offset++] = toClipX(target, x);
    data[offset++] = toClipY(target, y);
    data[offset++] = color.r;
    data[offset++] = color.g;
    data[offset++] = color.b;
    data[offset++] = color.a;
    return offset;
}

function writeTexturedVertex(
    data: Float32Array,
    offset: number,
    target: RenderTargetInfo,
    x: number,
    y: number,
    u: number,
    v: number,
    color: RenderPreparedColor,
): number {
    data[offset++] = toClipX(target, x);
    data[offset++] = toClipY(target, y);
    data[offset++] = u;
    data[offset++] = v;
    data[offset++] = color.r;
    data[offset++] = color.g;
    data[offset++] = color.b;
    data[offset++] = color.a;
    return offset;
}

function transformPoint(
    item: Render2DPreparedItem,
    x: number,
    y: number,
): { x: number; y: number } {
    const transform = item.transform;
    if (!transform) return { x, y };

    const localX = (x - transform.pivotX) * transform.scaleX;
    const localY = (y - transform.pivotY) * transform.scaleY;
    const cos = Math.cos(transform.radians);
    const sin = Math.sin(transform.radians);

    return {
        x:
            transform.x +
            transform.offsetX +
            transform.pivotX +
            localX * cos -
            localY * sin,
        y:
            transform.y +
            transform.offsetY +
            transform.pivotY +
            localX * sin +
            localY * cos,
    };
}

function writeSolidTriangle(
    data: Float32Array,
    offset: number,
    frame: Render2DPreparedFrame,
    item: Render2DPreparedItem,
    a: { x: number; y: number },
    b: { x: number; y: number },
    c: { x: number; y: number },
): number {
    offset = writeSolidVertex(data, offset, frame.target, a.x, a.y, item.color);
    offset = writeSolidVertex(data, offset, frame.target, b.x, b.y, item.color);
    return writeSolidVertex(data, offset, frame.target, c.x, c.y, item.color);
}

function writeRectVertices(
    data: Float32Array,
    offset: number,
    frame: Render2DPreparedFrame,
    item: Render2DPreparedItem,
    rect: Extract<RenderItem2D, { kind: "rect" | "sprite" }>,
): number {
    const a = transformPoint(item, 0, 0);
    const b = transformPoint(item, rect.w, 0);
    const c = transformPoint(item, 0, rect.h);
    const d = transformPoint(item, rect.w, rect.h);

    if (item.vertexLayout === "position-uv-tint-2d") {
        const uv =
            rect.kind === "sprite" && rect.uv
                ? rect.uv
                : { u: 0, v: 0, w: 1, h: 1 };
        offset = writeTexturedVertex(
            data,
            offset,
            frame.target,
            a.x,
            a.y,
            uv.u,
            uv.v,
            item.color,
        );
        offset = writeTexturedVertex(
            data,
            offset,
            frame.target,
            b.x,
            b.y,
            uv.u + uv.w,
            uv.v,
            item.color,
        );
        offset = writeTexturedVertex(
            data,
            offset,
            frame.target,
            c.x,
            c.y,
            uv.u,
            uv.v + uv.h,
            item.color,
        );
        offset = writeTexturedVertex(
            data,
            offset,
            frame.target,
            c.x,
            c.y,
            uv.u,
            uv.v + uv.h,
            item.color,
        );
        offset = writeTexturedVertex(
            data,
            offset,
            frame.target,
            b.x,
            b.y,
            uv.u + uv.w,
            uv.v,
            item.color,
        );
        return writeTexturedVertex(
            data,
            offset,
            frame.target,
            d.x,
            d.y,
            uv.u + uv.w,
            uv.v + uv.h,
            item.color,
        );
    }

    offset = writeSolidTriangle(data, offset, frame, item, a, b, c);
    return writeSolidTriangle(data, offset, frame, item, c, b, d);
}

function writeCircleLikeVertices(
    data: Float32Array,
    offset: number,
    frame: Render2DPreparedFrame,
    item: Render2DPreparedItem,
    radiusX: number,
    radiusY: number,
    segments: number,
): number {
    const center = transformPoint(item, 0, 0);
    for (let i = 0; i < segments; i++) {
        const start = (i / segments) * Math.PI * 2;
        const end = ((i + 1) / segments) * Math.PI * 2;
        offset = writeSolidTriangle(
            data,
            offset,
            frame,
            item,
            center,
            transformPoint(item, Math.cos(start) * radiusX, Math.sin(start) * radiusY),
            transformPoint(item, Math.cos(end) * radiusX, Math.sin(end) * radiusY),
        );
    }
    return offset;
}

function writeLineVertices(
    data: Float32Array,
    offset: number,
    frame: Render2DPreparedFrame,
    item: Render2DPreparedItem,
    line: Extract<RenderItem2D, { kind: "line" }>,
): number {
    const width = line.strokeWidth ?? 1;
    const dx = line.endX - line.startX;
    const dy = line.endY - line.startY;
    const length = Math.hypot(dx, dy);
    if (length <= 0 || width <= 0) return offset;

    const nx = (-dy / length) * (width / 2);
    const ny = (dx / length) * (width / 2);
    const a = { x: line.startX + nx, y: line.startY + ny };
    const b = { x: line.endX + nx, y: line.endY + ny };
    const c = { x: line.startX - nx, y: line.startY - ny };
    const d = { x: line.endX - nx, y: line.endY - ny };

    offset = writeSolidTriangle(data, offset, frame, item, a, b, c);
    return writeSolidTriangle(data, offset, frame, item, c, b, d);
}

function writePolygonVertices(
    data: Float32Array,
    offset: number,
    frame: Render2DPreparedFrame,
    item: Render2DPreparedItem,
    polygon: Extract<RenderItem2D, { kind: "polygon" }>,
): number {
    const origin = transformPoint(item, polygon.vertices[0].x, polygon.vertices[0].y);
    for (let i = 1; i < polygon.vertices.length - 1; i++) {
        offset = writeSolidTriangle(
            data,
            offset,
            frame,
            item,
            origin,
            transformPoint(item, polygon.vertices[i].x, polygon.vertices[i].y),
            transformPoint(
                item,
                polygon.vertices[i + 1].x,
                polygon.vertices[i + 1].y,
            ),
        );
    }
    return offset;
}

function writeItemVertices(
    data: Float32Array,
    offset: number,
    frame: Render2DPreparedFrame,
    item: Render2DPreparedItem,
): number {
    switch (item.item.kind) {
        case "rect":
        case "sprite":
            return writeRectVertices(data, offset, frame, item, item.item);
        case "circle":
            return writeCircleLikeVertices(
                data,
                offset,
                frame,
                item,
                item.item.radius,
                item.item.radius,
                24,
            );
        case "ellipse":
            return writeCircleLikeVertices(
                data,
                offset,
                frame,
                item,
                item.item.radiusX,
                item.item.radiusY,
                24,
            );
        case "line":
            return writeLineVertices(data, offset, frame, item, item.item);
        case "polygon":
            return writePolygonVertices(data, offset, frame, item, item.item);
    }
}

function ensureArenaCapacity(
    arena: Float32Array<ArrayBufferLike>,
    floats: number,
): Float32Array<ArrayBufferLike> {
    if (arena.length >= floats) return arena;
    let size = Math.max(64, arena.length);
    while (size < floats) size *= 2;
    return new Float32Array(size);
}

function writeBatchVertexData(
    arena: Float32Array<ArrayBufferLike>,
    frame: Render2DPreparedFrame,
    batch: Render2DPreparedBatch,
): { data: Float32Array<ArrayBufferLike>; length: number } {
    const layout = WEBGL2_VERTEX_LAYOUTS[batch.vertexLayout];
    const neededFloats = batch.vertexCount * layout.strideFloats;
    const data = ensureArenaCapacity(arena, neededFloats);
    let offset = 0;

    for (let i = 0; i < batch.itemCount; i++) {
        const item = frame.items[batch.itemStart + i];
        offset = writeItemVertices(data, offset, frame, item);
    }

    return { data, length: offset };
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
        const written = writeBatchVertexData(vertexArena, frame, batch);
        vertexArena = written.data;
        if (written.length === 0) {
            return { result: "submitted", metrics: EMPTY_SUBMIT_METRICS };
        }

        const pipeline = config.pipelineLibrary.getWebGl2Pipeline({
            desc: getPipelineDescriptor(batch),
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

        const layout = WEBGL2_VERTEX_LAYOUTS[batch.vertexLayout];
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
