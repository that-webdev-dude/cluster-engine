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
import { createWorldPublisherModule } from "../modules/WorldPublisher.module";
import { createWorldStorageModule } from "../modules/WorldStorage.module";

function createWorldManagerService(
    config?: WorldManagerConfig,
): WorldManagerService {
    const debug = config?.debug ?? false;

    const commandQueue = createWorldCommandQueueModule();
    const worldStorage = createWorldStorageModule({ debug });
    const publisher = createWorldPublisherModule();
    let snapshot: WorldManagerSnapshot = publisher.snapshot();

    const handleDispose = (_from: LifecycleLivePhase) => {
        commandQueue.reset();
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

    function applyClear() {
        worldStorage.clear();
    }

    function flush() {
        lifecycle.assertNotDisposed();
        if (!lifecycle.isRunning()) return;

        commandQueue.flush({
            spawn: applySpawn,
            destroy: applyDestroy,
            clear: applyClear,
        });
    }

    function publish() {
        lifecycle.assertNotDisposed();
        if (!lifecycle.isRunning()) return;

        publishSnapshot();
    }

    function publishSnapshot() {
        snapshot = publisher.publish(worldStorage.createDebugSnapshot());
    }

    function query(storeId: string, componentNames: readonly string[]) {
        lifecycle.assertNotDisposed();
        if (!lifecycle.isRunning()) return [];

        return worldStorage.query(storeId, componentNames);
    }

    const request = Object.freeze({
        spawn: (storeId: string, entity: Entity) =>
            commandQueue.spawn(storeId, entity),
        destroy: (storeId: string, entityId: EntityId) =>
            commandQueue.destroy(storeId, entityId),
        clear: () => commandQueue.clear(),
    });

    return {
        view: createWorldManagerView(() => snapshot),
        start: lifecycle.start,
        stop: lifecycle.stop,
        flush,
        publish,
        query,
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
