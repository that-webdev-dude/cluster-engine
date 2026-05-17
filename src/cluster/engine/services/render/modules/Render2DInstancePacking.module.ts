import type { PipelineDescriptor } from "../backend/pipelineLibrary";
import type {
    Render2DPreparedBatch,
    Render2DPreparedFrame,
    Render2DPreparedItem,
    RenderPreparedColor,
} from "./Render2DPrepare.module";
import type { RenderUvRectInput } from "../service/Render.types";
import { BYTES_PER_FLOAT } from "./Render2DGeometryLayout.module";

export type Render2DInstanceLayoutKey =
    | "quad-solid-instance-2d"
    | "quad-textured-instance-2d"
    | "line-solid-instance-2d"
    | "circle-solid-instance-2d"
    | "polygon-solid-instance-2d";

export type Render2DInstanceLayoutInfo = Readonly<{
    strideFloats: number;
    attrs: readonly {
        location: number;
        size: number;
        offsetFloats: number;
    }[];
}>;

export type PackedRender2DInstanceRange = Readonly<{
    data: Float32Array<ArrayBufferLike>;
    offset: number;
    length: number;
    nextOffset: number;
}>;

export const RENDER_2D_INSTANCE_LAYOUTS: Record<
    Render2DInstanceLayoutKey,
    Render2DInstanceLayoutInfo
> = {
    "quad-solid-instance-2d": {
        strideFloats: 24,
        attrs: [
            { location: 1, size: 4, offsetFloats: 0 },
            { location: 2, size: 4, offsetFloats: 4 },
            { location: 3, size: 4, offsetFloats: 8 },
            { location: 4, size: 2, offsetFloats: 12 },
            { location: 5, size: 4, offsetFloats: 14 },
            { location: 6, size: 4, offsetFloats: 18 },
            { location: 7, size: 2, offsetFloats: 22 },
        ],
    },
    "quad-textured-instance-2d": {
        strideFloats: 28,
        attrs: [
            { location: 1, size: 4, offsetFloats: 0 },
            { location: 2, size: 4, offsetFloats: 4 },
            { location: 3, size: 4, offsetFloats: 8 },
            { location: 4, size: 2, offsetFloats: 12 },
            { location: 5, size: 4, offsetFloats: 14 },
            { location: 6, size: 4, offsetFloats: 18 },
            { location: 7, size: 4, offsetFloats: 22 },
            { location: 8, size: 2, offsetFloats: 26 },
        ],
    },
    "line-solid-instance-2d": {
        strideFloats: 12,
        attrs: [
            { location: 1, size: 4, offsetFloats: 0 },
            { location: 2, size: 4, offsetFloats: 4 },
            { location: 3, size: 4, offsetFloats: 8 },
        ],
    },
    "circle-solid-instance-2d": {
        strideFloats: 22,
        attrs: [
            { location: 1, size: 4, offsetFloats: 0 },
            { location: 2, size: 4, offsetFloats: 4 },
            { location: 3, size: 4, offsetFloats: 8 },
            { location: 4, size: 2, offsetFloats: 12 },
            { location: 5, size: 2, offsetFloats: 14 },
            { location: 6, size: 4, offsetFloats: 16 },
            { location: 7, size: 2, offsetFloats: 20 },
        ],
    },
    "polygon-solid-instance-2d": {
        strideFloats: 20,
        attrs: [
            { location: 1, size: 4, offsetFloats: 0 },
            { location: 2, size: 4, offsetFloats: 4 },
            { location: 3, size: 4, offsetFloats: 8 },
            { location: 4, size: 2, offsetFloats: 12 },
            { location: 5, size: 4, offsetFloats: 14 },
            { location: 6, size: 2, offsetFloats: 18 },
        ],
    },
};

export function getRender2DQuadInstancePipelineDescriptor(
    batch: Render2DPreparedBatch,
): PipelineDescriptor {
    if (batch.pipelineFamily === "textured-2d") {
        return {
            shaderFamily: "textured-2d",
            passKey: batch.layerId,
            materialKey: "textured:quad-instance",
            primitive: "triangles",
            blend: batch.blendMode,
            vertexLayoutKey: "quad-textured-instance-2d",
        };
    }

    return {
        shaderFamily: "solid-2d",
        passKey: batch.layerId,
        materialKey: "solid:quad-instance",
        primitive: "triangles",
        blend: batch.blendMode,
        vertexLayoutKey: "quad-solid-instance-2d",
    };
}

export function getRender2DPrimitiveInstancePipelineDescriptor(
    batch: Render2DPreparedBatch,
    layout: Render2DInstanceLayoutKey,
): PipelineDescriptor {
    return {
        shaderFamily: "solid-2d",
        passKey: batch.layerId,
        materialKey: `solid:${layout}`,
        primitive: "triangles",
        blend: batch.blendMode,
        vertexLayoutKey: layout,
    };
}

export function getRender2DQuadInstanceLayout(
    item: Render2DPreparedItem,
): Render2DInstanceLayoutKey {
    return item.pipelineFamily === "textured-2d"
        ? "quad-textured-instance-2d"
        : "quad-solid-instance-2d";
}

export function isRender2DQuadInstanceItem(
    item: Render2DPreparedItem,
): boolean {
    if (item.vertexCount !== 6) return false;
    if (item.geometry.kind === "glyph-quad") return item.sourceKind === "text";
    return (
        item.geometry.kind === "rect-quad" &&
        (item.sourceKind === "rect" || item.sourceKind === "sprite")
    );
}

export function isRender2DPrimitiveInstanceItem(
    item: Render2DPreparedItem,
): boolean {
    return (
        item.geometry.kind === "line" ||
        item.geometry.kind === "circle-like" ||
        item.geometry.kind === "polygon"
    );
}

export function getRender2DPrimitiveInstanceLayout(
    item: Render2DPreparedItem,
): Render2DInstanceLayoutKey {
    switch (item.geometry.kind) {
        case "line":
            return "line-solid-instance-2d";
        case "circle-like":
            return "circle-solid-instance-2d";
        case "polygon":
            return "polygon-solid-instance-2d";
        default:
            return getRender2DQuadInstanceLayout(item);
    }
}

function writeColor(
    data: Float32Array,
    offset: number,
    color: RenderPreparedColor,
): number {
    data[offset++] = color.r;
    data[offset++] = color.g;
    data[offset++] = color.b;
    data[offset++] = color.a;
    return offset;
}

function writeUv(
    data: Float32Array,
    offset: number,
    uv: RenderUvRectInput | undefined,
): number {
    const rect = uv ?? { u: 0, v: 0, w: 1, h: 1 };
    data[offset++] = rect.u;
    data[offset++] = rect.v;
    data[offset++] = rect.w;
    data[offset++] = rect.h;
    return offset;
}

function writeInstanceTransform(
    data: Float32Array,
    offset: number,
    item: Render2DPreparedItem,
): number {
    const transform = item.instanceTransform;
    const x = transform?.x ?? 0;
    const y = transform?.y ?? 0;
    const scaleX = transform?.scaleX ?? 1;
    const scaleY = transform?.scaleY ?? 1;
    const radians = transform?.radians ?? 0;

    data[offset++] = x;
    data[offset++] = y;
    data[offset++] = transform?.prevX ?? x;
    data[offset++] = transform?.prevY ?? y;
    data[offset++] = scaleX;
    data[offset++] = scaleY;
    data[offset++] = transform?.prevScaleX ?? scaleX;
    data[offset++] = transform?.prevScaleY ?? scaleY;
    data[offset++] = radians;
    data[offset++] = transform?.prevRadians ?? radians;
    data[offset++] = transform?.offsetX ?? 0;
    data[offset++] = transform?.offsetY ?? 0;
    data[offset++] = transform?.pivotX ?? 0;
    data[offset++] = transform?.pivotY ?? 0;
    return offset;
}

export function ensureRender2DInstanceArenaCapacity(
    arena: Float32Array<ArrayBufferLike>,
    floats: number,
): Float32Array<ArrayBufferLike> {
    if (arena.length >= floats) return arena;
    let size = Math.max(64, arena.length);
    while (size < floats) size *= 2;
    return new Float32Array(size);
}

export function writeRender2DQuadInstanceDataAtOffset(
    arena: Float32Array<ArrayBufferLike>,
    frame: Render2DPreparedFrame,
    itemStart: number,
    itemCount: number,
    layout: Render2DInstanceLayoutKey,
    offset: number,
): PackedRender2DInstanceRange {
    const layoutInfo = RENDER_2D_INSTANCE_LAYOUTS[layout];
    const neededFloats = offset + itemCount * layoutInfo.strideFloats;
    const data = ensureRender2DInstanceArenaCapacity(arena, neededFloats);
    const startOffset = offset;

    for (let i = 0; i < itemCount; i++) {
        const item = frame.items[itemStart + i];
        if (
            item.geometry.kind !== "rect-quad" &&
            item.geometry.kind !== "glyph-quad"
        ) {
            continue;
        }

        offset = writeInstanceTransform(data, offset, item);
        data[offset++] =
            item.geometry.kind === "glyph-quad" ? item.geometry.x : 0;
        data[offset++] =
            item.geometry.kind === "glyph-quad" ? item.geometry.y : 0;
        data[offset++] = item.geometry.w;
        data[offset++] = item.geometry.h;

        if (layout === "quad-textured-instance-2d") {
            offset = writeUv(data, offset, item.geometry.uv);
        }

        offset = writeColor(data, offset, item.color);
        data[offset++] = item.resourceId === undefined ? 0 : 1;
        data[offset++] = item.sourceIndex;
    }

    return {
        data,
        offset: startOffset,
        length: offset - startOffset,
        nextOffset: offset,
    };
}

export function writeRender2DPrimitiveInstanceDataAtOffset(
    arena: Float32Array<ArrayBufferLike>,
    frame: Render2DPreparedFrame,
    itemStart: number,
    itemCount: number,
    layout: Render2DInstanceLayoutKey,
    offset: number,
): PackedRender2DInstanceRange {
    const layoutInfo = RENDER_2D_INSTANCE_LAYOUTS[layout];
    const neededFloats = offset + itemCount * layoutInfo.strideFloats;
    const data = ensureRender2DInstanceArenaCapacity(arena, neededFloats);
    const startOffset = offset;

    for (let i = 0; i < itemCount; i++) {
        const item = frame.items[itemStart + i];

        if (layout === "line-solid-instance-2d") {
            if (item.geometry.kind !== "line") continue;
            data[offset++] = item.geometry.startX;
            data[offset++] = item.geometry.startY;
            data[offset++] = item.geometry.endX;
            data[offset++] = item.geometry.endY;
            data[offset++] = item.geometry.strokeWidth;
            data[offset++] = 0;
            data[offset++] = 0;
            data[offset++] = 0;
            offset = writeColor(data, offset, item.color);
            continue;
        }

        offset = writeInstanceTransform(data, offset, item);

        if (layout === "circle-solid-instance-2d") {
            if (item.geometry.kind !== "circle-like") continue;
            data[offset++] = item.geometry.radiusX;
            data[offset++] = item.geometry.radiusY;
            offset = writeColor(data, offset, item.color);
            data[offset++] = item.sourceIndex;
            data[offset++] = 0;
            continue;
        }

        if (item.geometry.kind !== "polygon") continue;
        offset = writeColor(data, offset, item.color);
        data[offset++] = item.sourceIndex;
        data[offset++] = 0;
    }

    return {
        data,
        offset: startOffset,
        length: offset - startOffset,
        nextOffset: offset,
    };
}

export const RENDER_2D_UNIT_QUAD_VERTEX_DATA = new Float32Array([
    0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,
]);

export const RENDER_2D_UNIT_QUAD_VERTEX_BYTE_LENGTH =
    RENDER_2D_UNIT_QUAD_VERTEX_DATA.byteLength;

export const RENDER_2D_UNIT_LINE_VERTEX_DATA = new Float32Array([
    0, 1, 1, 1, 0, -1, 0, -1, 1, 1, 1, -1,
]);

function createUnitCircleVertexData(segments = 24): Float32Array {
    const data = new Float32Array(segments * 6);
    let offset = 0;
    for (let i = 0; i < segments; i++) {
        const start = (i / segments) * Math.PI * 2;
        const end = ((i + 1) / segments) * Math.PI * 2;
        data[offset++] = 0;
        data[offset++] = 0;
        data[offset++] = Math.cos(start);
        data[offset++] = Math.sin(start);
        data[offset++] = Math.cos(end);
        data[offset++] = Math.sin(end);
    }
    return data;
}

export const RENDER_2D_UNIT_CIRCLE_VERTEX_DATA = createUnitCircleVertexData();

export const RENDER_2D_INSTANCE_BYTES_PER_FLOAT = BYTES_PER_FLOAT;
