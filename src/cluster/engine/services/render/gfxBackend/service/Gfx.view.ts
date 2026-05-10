import type { GfxSnapshot, GfxView } from "./Gfx.types";

export function createGfxView(getSnapshot: () => GfxSnapshot): GfxView {
    return Object.freeze({
        get backend() {
            return getSnapshot().backend;
        },
        get state() {
            return getSnapshot().state;
        },
        get caps() {
            return getSnapshot().caps;
        },
    });
}
