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
        get storeCount() {
            return getSnapshot().storeCount;
        },
        get entityCount() {
            return getSnapshot().entityCount;
        },
        get debug() {
            return getSnapshot().debug;
        },
    });
}
