import type { RenderResolvedTransform2D } from "./Interpolation.module";
import type {
    RenderBlendMode,
    RenderFrameInput,
    RenderFrameStats,
    RenderLayerId,
    RenderLine2D,
    RenderPoint2DInput,
    RenderResourceId,
    RenderTargetInfo,
    RenderTransform2DInput,
    RenderUvRectInput,
} from "../service/Render.types";

export type Render2DHandoffPipelineFamily = "solid-2d" | "textured-2d";

export type Render2DHandoffVertexLayout =
    | "position-color-2d"
    | "position-uv-tint-2d";

export type Render2DHandoffSourceKind =
    | "rect"
    | "sprite"
    | "text"
    | "line"
    | "circle"
    | "ellipse"
    | "polygon";

export type Render2DHandoffColor = Readonly<{
    r: number;
    g: number;
    b: number;
    a: number;
}>;

export type Render2DHandoffRectQuad2D = Readonly<{
    kind: "rect-quad";
    w: number;
    h: number;
    uv?: RenderUvRectInput;
}>;

export type Render2DHandoffCircleLike2D = Readonly<{
    kind: "circle-like";
    radiusX: number;
    radiusY: number;
    segments: number;
}>;

export type Render2DHandoffLine2D = Readonly<
    {
        kind: "line";
    } & Pick<RenderLine2D, "startX" | "startY" | "endX" | "endY"> & {
            strokeWidth: number;
        }
>;

export type Render2DHandoffPolygon2D = Readonly<{
    kind: "polygon";
    vertices: readonly RenderPoint2DInput[];
    localGeometryKey: string;
}>;

export type Render2DHandoffGlyphQuad2D = Readonly<{
    kind: "glyph-quad";
    sourceKind: "text";
    sourceIndex: number;
    glyphIndex: number;
    resourceId: RenderResourceId;
    x: number;
    y: number;
    w: number;
    h: number;
    uv: RenderUvRectInput;
}>;

export type Render2DHandoffGeometry =
    | Render2DHandoffRectQuad2D
    | Render2DHandoffCircleLike2D
    | Render2DHandoffLine2D
    | Render2DHandoffPolygon2D
    | Render2DHandoffGlyphQuad2D;

export type Render2DHandoffCommand = Readonly<{
    layerId: RenderLayerId;
    layerOrder: number;
    sourceIndex: number;
    sortKey: number;
    sourceKind: Render2DHandoffSourceKind;
    kind: Render2DHandoffGeometry["kind"];
    pipelineFamily: Render2DHandoffPipelineFamily;
    vertexLayout: Render2DHandoffVertexLayout;
    blendMode: RenderBlendMode;
    resourceId?: RenderResourceId;
    vertexCount: number;
    x?: number;
    y?: number;
    transform?: RenderResolvedTransform2D;
    instanceTransform?: RenderTransform2DInput;
    color: Render2DHandoffColor;
    geometry: Render2DHandoffGeometry;
}>;

export type Render2DHandoffBatch = Readonly<{
    layerId: RenderLayerId;
    pipelineFamily: Render2DHandoffPipelineFamily;
    vertexLayout: Render2DHandoffVertexLayout;
    blendMode: RenderBlendMode;
    resourceId?: RenderResourceId;
    containsText: boolean;
    itemStart: number;
    itemCount: number;
    vertexCount: number;
}>;

export type Render2DHandoffStats = RenderFrameStats;

export type Render2DHandoffFrame = Readonly<{
    target: RenderTargetInfo;
    alpha: number;
    camera?: RenderFrameInput["camera"];
    items: readonly Render2DHandoffCommand[];
    itemCount: number;
    batches: readonly Render2DHandoffBatch[];
    batchCount: number;
    stats: Render2DHandoffStats;
}>;

export type Render2DHandoffAdapter = Readonly<{
    fromPreparedFrame(frame: Render2DHandoffFrame): Render2DHandoffFrame;
}>;

export function createRender2DHandoffAdapter(): Render2DHandoffAdapter {
    return Object.freeze({
        fromPreparedFrame(frame: Render2DHandoffFrame): Render2DHandoffFrame {
            return frame;
        },
    });
}
