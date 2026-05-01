import type { Entity, EntityId } from "../entity";
import type {
    WorldManagerConfig,
    WorldManagerService,
    WorldManagerSnapshot,
} from "./WorldManager.types";
import { createWorldManagerView } from "./WorldManager.view";
import {
    createLifecycle,
    LifecycleLivePhase,
} from "../../../controllers/Lifecycle.controller";
import { createWorldCommandQueueModule } from "../modules/WorldCommandQueue.module";
import { createWorldStorageModule } from "../modules/WorldStorage.module";

function createWorldManagerService(
    config?: WorldManagerConfig,
): WorldManagerService {
    const debug = config?.debug ?? false;
    const snapshot: WorldManagerSnapshot = {
        rev: 0,
        changed: false,
        storeCount: 0,
    };

    const commandQueue = createWorldCommandQueueModule();
    const worldStorage = createWorldStorageModule({ debug });
    let publishedEntityCount = 0;

    const handleDispose = (_from: LifecycleLivePhase) => {
        commandQueue.clear();
        worldStorage.dispose();
        publishSnapshot();
    };

    const lifecycle = createLifecycle({
        tag: "WorldService",
        debug,
        onDispose: handleDispose,
    });

    function applySpawn(storeId: string, entity: Entity) {
        worldStorage.spawn(storeId, entity);
    }

    function applyDestroy(storeId: string, entityId: EntityId) {
        worldStorage.destroy(storeId, entityId);
    }

    function flush() {
        lifecycle.assertNotDisposed();
        if (!lifecycle.isRunning()) return;

        commandQueue.flush({
            spawn: applySpawn,
            destroy: applyDestroy,
        });
    }

    function publish() {
        lifecycle.assertNotDisposed();
        if (!lifecycle.isRunning()) return;

        publishSnapshot();
    }

    function publishSnapshot() {
        const storeCount = worldStorage.getStoreCount();
        const entityCount = worldStorage.getEntityCount();
        const changed =
            snapshot.storeCount !== storeCount ||
            publishedEntityCount !== entityCount;

        snapshot.changed = changed;
        if (!changed) return;

        snapshot.rev += 1;
        snapshot.storeCount = storeCount;
        publishedEntityCount = entityCount;
    }

    const request = Object.freeze({
        spawn: (storeId: string, entity: Entity) =>
            commandQueue.spawn(storeId, entity),
        destroy: (storeId: string, entityId: EntityId) =>
            commandQueue.destroy(storeId, entityId),
    });

    return {
        view: createWorldManagerView(() => snapshot),
        start: lifecycle.start,
        stop: lifecycle.stop,
        flush,
        publish,
        dispose: lifecycle.dispose,
        commands: Object.freeze({
            request,
        }),
    };
}

export function createWorldManager(
    config?: WorldManagerConfig,
): WorldManagerService {
    return createWorldManagerService(config);
}
