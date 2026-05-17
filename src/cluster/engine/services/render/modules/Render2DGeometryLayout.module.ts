import type { PipelineDescriptor } from "../backend/pipelineLibrary";
import type {
    Render2DPreparedBatch,
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
