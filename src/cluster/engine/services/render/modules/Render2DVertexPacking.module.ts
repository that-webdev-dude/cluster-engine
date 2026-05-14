import type { PipelineDescriptor } from "../backend/pipelineLibrary";
import type {
    Render2DPreparedBatch,
    Render2DPreparedFrame,
    Render2DPreparedItem,
    RenderPreparedColor,
} from "./Render2DPrepare.module";
import type {
    RenderTargetInfo,
    RenderUvRectInput,
} from "../service/Render.types";

export type Render2DVertexLayoutInfo = Readonly<{
    strideFloats: number;
    attrs: readonly {
        location: number;
        size: number;
        offsetFloats: number;
    }[];
}>;

export type PackedRender2DVertexData = Readonly<{
    data: Float32Array<ArrayBufferLike>;
    length: number;
}>;

export type PackedRender2DVertexRange = Readonly<{
    data: Float32Array<ArrayBufferLike>;
    offset: number;
    length: number;
    nextOffset: number;
}>;

export const BYTES_PER_FLOAT = Float32Array.BYTES_PER_ELEMENT;

const SOLID_2D_STRIDE_FLOATS = 6;
const TEXTURED_2D_STRIDE_FLOATS = 8;

export const RENDER_2D_VERTEX_LAYOUTS: Record<
    Render2DPreparedItem["vertexLayout"],
    Render2DVertexLayoutInfo
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

export function getRender2DPipelineDescriptor(
    batch: Render2DPreparedBatch,
): PipelineDescriptor {
    if (batch.pipelineFamily === "textured-2d") {
        return {
            shaderFamily: "textured-2d",
            passKey: batch.layerId,
            materialKey: "textured",
            primitive: "triangles",
            blend: batch.blendMode,
            vertexLayoutKey: "position-uv-tint-2d",
        };
    }

    return {
        shaderFamily: "solid-2d",
        passKey: batch.layerId,
        materialKey: "solid",
        primitive: "triangles",
        blend: batch.blendMode,
        vertexLayoutKey: "position-color-2d",
    };
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
    rect: {
        x: number;
        y: number;
        w: number;
        h: number;
        uv?: RenderUvRectInput;
    },
): number {
    const a = transformPoint(item, rect.x, rect.y);
    const b = transformPoint(item, rect.x + rect.w, rect.y);
    const c = transformPoint(item, rect.x, rect.y + rect.h);
    const d = transformPoint(item, rect.x + rect.w, rect.y + rect.h);

    if (item.vertexLayout === "position-uv-tint-2d") {
        const uv = rect.uv ?? { u: 0, v: 0, w: 1, h: 1 };
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
            transformPoint(
                item,
                Math.cos(start) * radiusX,
                Math.sin(start) * radiusY,
            ),
            transformPoint(
                item,
                Math.cos(end) * radiusX,
                Math.sin(end) * radiusY,
            ),
        );
    }
    return offset;
}

function writeLineVertices(
    data: Float32Array,
    offset: number,
    frame: Render2DPreparedFrame,
    item: Render2DPreparedItem,
    line: Extract<Render2DPreparedItem["geometry"], { kind: "line" }>,
): number {
    const width = line.strokeWidth;
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
    polygon: Extract<Render2DPreparedItem["geometry"], { kind: "polygon" }>,
): number {
    const origin = transformPoint(
        item,
        polygon.vertices[0].x,
        polygon.vertices[0].y,
    );
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
    switch (item.geometry.kind) {
        case "rect-quad":
            return writeRectVertices(data, offset, frame, item, {
                x: 0,
                y: 0,
                w: item.geometry.w,
                h: item.geometry.h,
                uv: item.geometry.uv,
            });
        case "glyph-quad":
            return writeRectVertices(data, offset, frame, item, {
                x: item.geometry.x,
                y: item.geometry.y,
                w: item.geometry.w,
                h: item.geometry.h,
                uv: item.geometry.uv,
            });
        case "circle-like":
            return writeCircleLikeVertices(
                data,
                offset,
                frame,
                item,
                item.geometry.radiusX,
                item.geometry.radiusY,
                item.geometry.segments,
            );
        case "line":
            return writeLineVertices(data, offset, frame, item, item.geometry);
        case "polygon":
            return writePolygonVertices(
                data,
                offset,
                frame,
                item,
                item.geometry,
            );
    }
}

export function ensureRender2DVertexArenaCapacity(
    arena: Float32Array<ArrayBufferLike>,
    floats: number,
): Float32Array<ArrayBufferLike> {
    if (arena.length >= floats) return arena;
    let size = Math.max(64, arena.length);
    while (size < floats) size *= 2;
    return new Float32Array(size);
}

export function writeRender2DBatchVertexData(
    arena: Float32Array<ArrayBufferLike>,
    frame: Render2DPreparedFrame,
    batch: Render2DPreparedBatch,
): PackedRender2DVertexData {
    const written = writeRender2DBatchVertexDataAtOffset(
        arena,
        frame,
        batch,
        0,
    );

    return { data: written.data, length: written.length };
}

export function writeRender2DBatchVertexDataAtOffset(
    arena: Float32Array<ArrayBufferLike>,
    frame: Render2DPreparedFrame,
    batch: Render2DPreparedBatch,
    offset: number,
): PackedRender2DVertexRange {
    const layout = RENDER_2D_VERTEX_LAYOUTS[batch.vertexLayout];
    const neededFloats = offset + batch.vertexCount * layout.strideFloats;
    const data = ensureRender2DVertexArenaCapacity(arena, neededFloats);
    const startOffset = offset;

    for (let i = 0; i < batch.itemCount; i++) {
        const item = frame.items[batch.itemStart + i];
        offset = writeItemVertices(data, offset, frame, item);
    }

    return {
        data,
        offset: startOffset,
        length: offset - startOffset,
        nextOffset: offset,
    };
}
