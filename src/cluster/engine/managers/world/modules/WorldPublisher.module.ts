import type { WorldDebugSnapshot } from "./WorldStorage.module";
import type { WorldManagerSnapshot } from "../service/WorldManager.types";

export type WorldPublisherModule = {
    publish(debug: WorldDebugSnapshot): WorldManagerSnapshot;
    snapshot(): WorldManagerSnapshot;
};

const EMPTY_DEBUG_SNAPSHOT: WorldDebugSnapshot = Object.freeze({
    storeCount: 0,
    entityCount: 0,
    stores: Object.freeze([]),
});

export function createWorldPublisherModule(): WorldPublisherModule {
    let snapshot: WorldManagerSnapshot = {
        rev: 0,
        changed: false,
        storeCount: 0,
        entityCount: 0,
        debug: EMPTY_DEBUG_SNAPSHOT,
    };
    let publishedKey = stableKey(EMPTY_DEBUG_SNAPSHOT);

    function publish(debug: WorldDebugSnapshot): WorldManagerSnapshot {
        const nextKey = stableKey(debug);
        const changed = nextKey !== publishedKey;
        if (!changed) {
            snapshot = {
                ...snapshot,
                changed: false,
            };
            return snapshot;
        }

        publishedKey = nextKey;
        snapshot = {
            rev: snapshot.rev + 1,
            changed: true,
            storeCount: debug.storeCount,
            entityCount: debug.entityCount,
            debug,
        };
        return snapshot;
    }

    function currentSnapshot(): WorldManagerSnapshot {
        return snapshot;
    }

    return {
        publish,
        snapshot: currentSnapshot,
    };
}

function stableKey(snapshot: WorldDebugSnapshot): string {
    return JSON.stringify(snapshot);
}
