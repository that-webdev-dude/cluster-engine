import type {
    SceneManagerSnapshot,
    SceneManagerView,
} from "./SceneManager.types";

export function createSceneManagerView(
    getSnapshot: () => SceneManagerSnapshot,
): SceneManagerView {
    return Object.freeze({
        get rev() {
            return getSnapshot().rev;
        },
        get changed() {
            return getSnapshot().changed;
        },
        get stack() {
            return getSnapshot().plan.stack;
        },
        get input() {
            return getSnapshot().plan.input;
        },
        get fixedUpdate() {
            return getSnapshot().plan.fixedUpdate;
        },
        get preRender() {
            return getSnapshot().plan.preRender;
        },
    });
}
