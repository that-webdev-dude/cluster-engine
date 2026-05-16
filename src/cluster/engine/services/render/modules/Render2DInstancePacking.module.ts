import type { PipelineDescriptor } from "../backend/pipelineLibrary";
import type {
    Render2DPreparedBatch,
    Render2DPreparedFrame,
    Render2DPreparedItem,
    RenderPreparedColor,
} from "./Render2DPrepare.module";
import type { RenderUvRectInput } from "../service/Render.types";
import { BYTES_PER_FLOAT } from "./Render2DVertexPacking.module";

export type Render2DInstanceLayoutKey =
    | "quad-solid-instance-2d"
    | "quad-textured-instance-2d";

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
        strideFloats: 14,
        attrs: [
            { location: 1, size: 2, offsetFloats: 0 },
            { location: 2, size: 2, offsetFloats: 2 },
            { location: 3, size: 2, offsetFloats: 4 },
            { location: 4, size: 2, offsetFloats: 6 },
            { location: 5, size: 4, offsetFloats: 8 },
            { location: 6, size: 2, offsetFloats: 12 },
        ],
    },
    "quad-textured-instance-2d": {
        strideFloats: 18,
        attrs: [
            { location: 1, size: 2, offsetFloats: 0 },
            { location: 2, size: 2, offsetFloats: 2 },
            { location: 3, size: 2, offsetFloats: 4 },
            { location: 4, size: 2, offsetFloats: 6 },
            { location: 5, size: 4, offsetFloats: 8 },
            { location: 6, size: 4, offsetFloats: 12 },
            { location: 7, size: 2, offsetFloats: 16 },
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
    return (
        item.geometry.kind === "rect-quad" &&
        (item.sourceKind === "rect" || item.sourceKind === "sprite") &&
        item.vertexCount === 6
    );
}

function toClipX(width: number, x: number): number {
    return (x / width) * 2 - 1;
}

function toClipY(height: number, y: number): number {
    return 1 - (y / height) * 2;
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

function writeTransformBasis(
    data: Float32Array,
    offset: number,
    frame: Render2DPreparedFrame,
    item: Render2DPreparedItem,
): number {
    const transform = item.transform;
    const target = frame.target;

    if (!transform) {
        data[offset++] = toClipX(target.w, 0);
        data[offset++] = toClipY(target.h, 0);
        data[offset++] = 2 / target.w;
        data[offset++] = 0;
        data[offset++] = 0;
        data[offset++] = -2 / target.h;
        return offset;
    }

    const cos = Math.cos(transform.radians);
    const sin = Math.sin(transform.radians);
    const originLocalX = -transform.pivotX * transform.scaleX;
    const originLocalY = -transform.pivotY * transform.scaleY;
    const originX =
        transform.x +
        transform.offsetX +
        transform.pivotX +
        originLocalX * cos -
        originLocalY * sin;
    const originY =
        transform.y +
        transform.offsetY +
        transform.pivotY +
        originLocalX * sin +
        originLocalY * cos;
    const axisXX = transform.scaleX * cos;
    const axisXY = transform.scaleX * sin;
    const axisYX = -transform.scaleY * sin;
    const axisYY = transform.scaleY * cos;

    data[offset++] = toClipX(target.w, originX);
    data[offset++] = toClipY(target.h, originY);
    data[offset++] = (axisXX / target.w) * 2;
    data[offset++] = -(axisXY / target.h) * 2;
    data[offset++] = (axisYX / target.w) * 2;
    data[offset++] = -(axisYY / target.h) * 2;
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
        if (item.geometry.kind !== "rect-quad") continue;

        offset = writeTransformBasis(data, offset, frame, item);
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

export const RENDER_2D_UNIT_QUAD_VERTEX_DATA = new Float32Array([
    0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,
]);

export const RENDER_2D_UNIT_QUAD_VERTEX_BYTE_LENGTH =
    RENDER_2D_UNIT_QUAD_VERTEX_DATA.byteLength;

export const RENDER_2D_INSTANCE_BYTES_PER_FLOAT = BYTES_PER_FLOAT;
