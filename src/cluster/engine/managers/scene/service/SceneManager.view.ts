import type {
    SceneManagerSnapshot,
    SceneManagerView,
} from "./SceneManager.types";

export function createSceneManagerView(
    getSnapshot: () => SceneManagerSnapshot
): SceneManagerView {
    return Object.freeze({
        get rev() {
            return getSnapshot().rev;
        },
        get changed() {
            return getSnapshot().changed;
        },
        get stack() {
            return getSnapshot().stack;
        },
        get input() {
            return getSnapshot().input;
        },
        get update() {
            return getSnapshot().update;
        },
        get render() {
            return getSnapshot().render;
        },
    });
}
