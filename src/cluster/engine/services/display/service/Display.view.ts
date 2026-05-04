import type {
    DisplayView,
    DisplayTools,
    DisplaySnapshot,
} from "./Display.types";

export function createDisplayView(
    getSnapshot: () => DisplaySnapshot,
    tools: DisplayTools,
): DisplayView {
    const { cssToSurface, surfaceToCss, clientToSurface, surfaceToClient } =
        tools;

    return Object.freeze({
        get w() {
            return getSnapshot().w;
        },
        get h() {
            return getSnapshot().h;
        },
        get dpr() {
            return getSnapshot().dpr;
        },
        get rev() {
            return getSnapshot().rev;
        },
        get changed() {
            return getSnapshot().changed;
        },
        get cssW() {
            return getSnapshot().cssW;
        },
        get cssH() {
            return getSnapshot().cssH;
        },
        get rect() {
            return getSnapshot().rect;
        },
        get isFullscreen() {
            return getSnapshot().isFullscreen;
        },

        cssToSurface,
        surfaceToCss,
        surfaceToClient,
        clientToSurface,
    });
}
