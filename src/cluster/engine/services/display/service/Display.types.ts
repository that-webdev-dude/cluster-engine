import type { Vec2, Rect, Size } from "../../../types/geometry";
import type { EnginePlatform } from "../../../types/patform";

export type DisplayPlatform = Pick<EnginePlatform, "window" | "document">;

export type DisplayMode = "auto" | "fixed";

export type DisplayDpr = "device" | number;

export type DisplayOptions = Readonly<{
    size?: Size;
    dpr?: DisplayDpr;
    mode?: DisplayMode;
}>;

export type DisplayConfig = Readonly<{
    canvas: HTMLCanvasElement | OffscreenCanvas;
    options?: DisplayOptions;
    platform?: DisplayPlatform;
    debug?: boolean;
}>;

export type DisplayTools = Readonly<{
    cssToSurface(x: number, y: number, out?: Vec2): Vec2;
    surfaceToCss(x: number, y: number, out?: Vec2): Vec2;
    surfaceToClient(x: number, y: number, out?: Vec2): Vec2;
    clientToSurface(clientX: number, clientY: number, out?: Vec2): Vec2;
}>;

export type DisplayView = Readonly<{
    rev: number;
    w: number;
    h: number;
    dpr: number;
    changed: boolean;
    cssW?: number;
    cssH?: number;
    rect?: Rect;
    isFullscreen?: boolean;
}> &
    DisplayTools;

export type DisplaySnapshot = {
    rev: number;
    w: number;
    h: number;
    dpr: number;
    changed: boolean;
    cssW?: number;
    cssH?: number;
    rect?: Rect;
    isFullscreen?: boolean;
};
