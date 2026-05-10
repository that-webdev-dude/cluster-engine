import type { RenderBackend, RenderGraphicsState } from "../../service/Render.types";

export type GfxBackend = Extract<RenderBackend, "webgl2">;

export type GfxState = Extract<RenderGraphicsState, "ok" | "lost">;

export type GfxCaps = Readonly<{
    maxTextureSize?: number;
    maxUniformBufferSize?: number;
}>;

export type GfxSnapshot = {
    backend: RenderBackend;
    state: RenderGraphicsState;
    caps: GfxCaps;
};

export type GfxView = Readonly<{
    readonly backend: RenderBackend;
    readonly state: RenderGraphicsState;
    readonly caps: GfxCaps;
}>;

export type GfxConfig = Readonly<{
    canvas: HTMLCanvasElement | OffscreenCanvas;
    debug?: boolean;
}>;
