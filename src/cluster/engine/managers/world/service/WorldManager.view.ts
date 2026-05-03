import type { WorldManagerSnapshot } from "./WorldManager.types";

export function createWorldManagerView(
    getSnapshot: () => Readonly<WorldManagerSnapshot>,
) {
    return Object.freeze({
        get rev() {
            return getSnapshot().rev;
        },
        get changed() {
            return getSnapshot().changed;
        },
        get debug() {
            return getSnapshot().debug;
        },
    });
}
