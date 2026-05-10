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
        get requestedBackend() {
            return getSnapshot().requestedBackend;
        },
        get selectedBackend() {
            return getSnapshot().selectedBackend;
        },
        get fallbackBackend() {
            return getSnapshot().fallbackBackend;
        },
        get unavailableBackend() {
            return getSnapshot().unavailableBackend;
        },
        get detectedBackends() {
            return getSnapshot().detectedBackends;
        },
        get lostBackend() {
            return getSnapshot().lostBackend;
        },
    });
}
