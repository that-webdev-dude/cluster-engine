export type RenderBackend = "none" | "webgl2" | "webgpu";

export type RenderGraphicsState = "unavailable" | "ok" | "lost";

export type RenderTargetInfo = Readonly<{
    w: number;
    h: number;
    dpr: number;
}>;

/** Renderer-owned layer identifier with no world, scene, or manager meaning. */
export type RenderLayerId = string;

/** Renderer-owned resource identifier. */
export type RenderResourceId = string;

/** Renderer-owned bitmap font identifier. */
export type RenderFontId = string;

/** Font-config-local atlas page identifier. */
export type RenderFontPageId = string;

/** Camera state supplied as renderer-domain frame input. */
export type RenderCameraInput = Readonly<{
    x: number;
    y: number;
    zoom: number;
    shakeX: number;
    shakeY: number;
}>;

/** RGB color values in renderer-domain normalized 0..1 space. */
export type RenderColorInput = Readonly<{
    r: number;
    g: number;
    b: number;
}>;

/** Texture UV rectangle in normalized 0..1 texture space. */
export type RenderUvRectInput = Readonly<{
    u: number;
    v: number;
    w: number;
    h: number;
}>;

/** A local 2D point in renderer-domain coordinates. */
export type RenderPoint2DInput = Readonly<{
    x: number;
    y: number;
}>;

/** Optional bounds metadata for renderer-domain culling or diagnostics. */
export type RenderBounds2DInput = Readonly<{
    x: number;
    y: number;
    w: number;
    h: number;
}>;

/** Blend mode requested by a renderer-domain item. */
export type RenderBlendMode = "opaque" | "alpha";

/** Shared style data for renderer-domain 2D items. */
export type RenderStyle2DInput = Readonly<{
    color?: RenderColorInput;
    tint?: RenderColorInput;
    blend?: RenderBlendMode;
    opacity?: number;
}>;

/** Renderer-owned transform data, including optional previous-frame values. */
export type RenderTransform2DInput = Readonly<{
    x: number;
    y: number;
    prevX?: number;
    prevY?: number;
    offsetX?: number;
    offsetY?: number;
    scaleX?: number;
    scaleY?: number;
    prevScaleX?: number;
    prevScaleY?: number;
    pivotX?: number;
    pivotY?: number;
    radians?: number;
    prevRadians?: number;
}>;

/** Shared metadata for renderer-domain 2D items. */
export type RenderItem2DBase = Readonly<
    RenderStyle2DInput & {
        sortKey: number;
        resourceId?: RenderResourceId;
        bounds?: RenderBounds2DInput;
    }
>;

/** Axis-aligned or transformed rectangle item. */
export type RenderRect2D = Readonly<
    RenderItem2DBase &
        RenderTransform2DInput & {
            kind: "rect";
            w: number;
            h: number;
        }
>;

/** Textured rectangle item. */
export type RenderSprite2D = Readonly<
    RenderItem2DBase &
        RenderTransform2DInput & {
            kind: "sprite";
            w: number;
            h: number;
            uv?: RenderUvRectInput;
        }
>;

/** Circle item lowered by the renderer preparation path. */
export type RenderCircle2D = Readonly<
    RenderItem2DBase &
        RenderTransform2DInput & {
            kind: "circle";
            radius: number;
        }
>;

/** Ellipse item lowered by the renderer preparation path. */
export type RenderEllipse2D = Readonly<
    RenderItem2DBase &
        RenderTransform2DInput & {
            kind: "ellipse";
            radiusX: number;
            radiusY: number;
        }
>;

/** Polyline-style thick line item using absolute endpoints. */
export type RenderLine2D = Readonly<
    RenderItem2DBase & {
        kind: "line";
        startX: number;
        startY: number;
        endX: number;
        endY: number;
        strokeWidth?: number;
    }
>;

/** Polygon item using local vertices plus a renderer-domain transform. */
export type RenderPolygon2D = Readonly<
    RenderItem2DBase &
        RenderTransform2DInput & {
            kind: "polygon";
            vertices: readonly RenderPoint2DInput[];
        }
>;

/** Renderer-domain 2D item kinds supported by the first input contract. */
export type RenderItem2D =
    | RenderRect2D
    | RenderSprite2D
    | RenderCircle2D
    | RenderEllipse2D
    | RenderLine2D
    | RenderPolygon2D;

/** Ordered renderer-domain layer containing items to prepare together. */
export type RenderLayerInput = Readonly<{
    id: RenderLayerId;
    order: number;
    items: readonly RenderItem2D[];
}>;

export type RenderFrameInput = Readonly<{
    target: RenderTargetInfo;
    alpha: number;
    camera?: RenderCameraInput;
    layers: readonly RenderLayerInput[];
}>;

export type RenderSkipReason = "not-running" | "no-submitter" | "gfx-lost";

export type RenderSubmitResult =
    | { readonly status: "submitted" }
    | { readonly status: "skipped"; readonly reason: RenderSkipReason }
    | { readonly status: "no-frame" };

export type RenderFrameStats = Readonly<{
    passCount: number;
    commandCount: number;
    batchCount: number;
    drawCallCount: number;
    vertexCount: number;
    skippedResourceCount: number;
    fallbackResourceCount: number;
    textureResourceCount: number;
    fontResourceCount: number;
    fontPageResourceCount: number;
    fontReplacementRegistrationCount: number;
    invalidFontRegistrationCount: number;
    missingFontCount: number;
    missingGlyphCount: number;
}>;

export type RenderSnapshot = {
    backend: RenderBackend;
    gfxState: RenderGraphicsState;
    frameSeq: number;
    target: RenderTargetInfo;
    lastSubmitResult: RenderSubmitResult;
    stats: RenderFrameStats;
};

export type RenderView = Readonly<{
    readonly backend: RenderBackend;
    readonly gfxState: RenderGraphicsState;
    readonly frameSeq: number;
    readonly target: RenderTargetInfo;
    readonly lastSubmitResult: RenderSubmitResult;
    readonly stats: RenderFrameStats;
}>;

export type RenderTextureResourceConfig = Readonly<{
    id: RenderResourceId;
    label?: string;
    width: number;
    height: number;
    data: ArrayBufferView;
}>;

/** Atlas page metadata for a registered bitmap font. */
export type RenderBitmapFontPageConfig = Readonly<{
    id: RenderFontPageId;
    resourceId: RenderResourceId;
    width: number;
    height: number;
}>;

/** Glyph metrics and atlas rectangle for a registered bitmap font. */
export type RenderBitmapGlyphConfig = Readonly<{
    codepoint: number;
    pageId: RenderFontPageId;
    x: number;
    y: number;
    w: number;
    h: number;
    xOffset: number;
    yOffset: number;
    xAdvance: number;
}>;

/** Kerning adjustment between two bitmap font codepoints. */
export type RenderGlyphKerningConfig = Readonly<{
    left: number;
    right: number;
    amount: number;
}>;

/** Renderer-domain config for a pre-baked bitmap font atlas. */
export type RenderBitmapFontConfig = Readonly<{
    id: RenderFontId;
    label?: string;
    kind: "bitmap";
    baseSize: number;
    lineHeight: number;
    baseline: number;
    pages: readonly RenderBitmapFontPageConfig[];
    glyphs: readonly RenderBitmapGlyphConfig[];
    kernings?: readonly RenderGlyphKerningConfig[];
    replacementCodepoint?: number;
}>;

export type RenderResourceConfig = Readonly<{
    textures?: readonly RenderTextureResourceConfig[];
    fonts?: readonly RenderBitmapFontConfig[];
}>;

export type RenderConfig = Readonly<{
    debug?: boolean;
    canvas: HTMLCanvasElement | OffscreenCanvas;
    resources?: RenderResourceConfig;
}>;
