import type { PipelineDescriptor } from "../backend/pipelineLibrary";
import type {
    Render2DPreparedBatch,
    Render2DPreparedFrame,
    Render2DPreparedItem,
} from "./Render2DPrepare.module";

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

function writeItemVertices(
    offset: number,
): number {
    return offset;
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
    _frame: Render2DPreparedFrame,
    batch: Render2DPreparedBatch,
    offset: number,
): PackedRender2DVertexRange {
    const layout = RENDER_2D_VERTEX_LAYOUTS[batch.vertexLayout];
    const neededFloats = offset + batch.vertexCount * layout.strideFloats;
    const data = ensureRender2DVertexArenaCapacity(arena, neededFloats);
    const startOffset = offset;

    for (let i = 0; i < batch.itemCount; i++) {
        offset = writeItemVertices(offset);
    }

    return {
        data,
        offset: startOffset,
        length: offset - startOffset,
        nextOffset: offset,
    };
}
