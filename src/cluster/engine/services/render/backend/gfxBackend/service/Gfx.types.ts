import type { RenderBackend, RenderGraphicsState } from "../../../service/Render.types";

export type GfxBackend = Extract<RenderBackend, "webgl2" | "webgpu">;

export type GfxBackendSelectionPolicy = "auto";

export type GfxState = Extract<RenderGraphicsState, "ok" | "lost">;

export type GfxCaps = Readonly<{
    maxTextureSize?: number;
    maxUniformBufferSize?: number;
    maxBufferSize?: number;
}>;

export type GfxSnapshot = {
    backend: RenderBackend;
    state: RenderGraphicsState;
    caps: GfxCaps;
    requestedBackend: GfxBackendSelectionPolicy;
    selectedBackend: RenderBackend;
    fallbackBackend?: RenderBackend;
    unavailableBackend?: RenderBackend;
    detectedBackends: readonly GfxBackend[];
    lostBackend?: GfxBackend;
};

export type GfxView = Readonly<{
    readonly backend: RenderBackend;
    readonly state: RenderGraphicsState;
    readonly caps: GfxCaps;
    readonly requestedBackend: GfxBackendSelectionPolicy;
    readonly selectedBackend: RenderBackend;
    readonly fallbackBackend?: RenderBackend;
    readonly unavailableBackend?: RenderBackend;
    readonly detectedBackends: readonly GfxBackend[];
    readonly lostBackend?: GfxBackend;
}>;

export type GfxConfig = Readonly<{
    canvas: HTMLCanvasElement | OffscreenCanvas;
    debug?: boolean;
}>;
