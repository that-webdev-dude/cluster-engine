import type { RenderSnapshot, RenderView } from "./Render.types";

export function createRenderView(getSnapshot: () => RenderSnapshot): RenderView {
    return Object.freeze({
        get backend() {
            return getSnapshot().backend;
        },
        get gfxState() {
            return getSnapshot().gfxState;
        },
        get frameSeq() {
            return getSnapshot().frameSeq;
        },
        get target() {
            return getSnapshot().target;
        },
        get lastSubmitResult() {
            return getSnapshot().lastSubmitResult;
        },
        get stats() {
            return getSnapshot().stats;
        },
    });
}
