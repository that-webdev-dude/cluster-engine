export type RenderBackend = "none";

export type RenderGraphicsState = "unavailable";

export type RenderTargetInfo = Readonly<{
    w: number;
    h: number;
    dpr: number;
}>;

export type RenderFrameInput = Readonly<{
    target: RenderTargetInfo;
    alpha: number;
}>;

export type RenderSkipReason = "not-running" | "no-submitter";

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
    id: string;
    label?: string;
    width: number;
    height: number;
    data: ArrayBufferView;
}>;

export type RenderResourceConfig = Readonly<{
    textures?: readonly RenderTextureResourceConfig[];
}>;

export type RenderConfig = Readonly<{
    debug?: boolean;
    canvas: HTMLCanvasElement | OffscreenCanvas;
    resources?: RenderResourceConfig;
}>;
