import type { Entity, EntityId } from "../service/WorldManager.types";

export type WorldCommandSpawn = {
    type: "spawn";
    payload: {
        storeId: string;
        entity: Entity;
    };
};

export type WorldCommandDestroy = {
    type: "destroy";
    payload: {
        storeId: string;
        entityId: EntityId;
    };
};

export type WorldCommand = WorldCommandSpawn | WorldCommandDestroy;

export type WorldCommandQueueModule = {
    spawn(storeId: string, entity: Entity): void;
    destroy(storeId: string, entityId: EntityId): void;
    flush(on: {
        spawn: (storeId: string, entity: Entity) => void;
        destroy: (storeId: string, entityId: EntityId) => void;
    }): void;
    clear(): void;
};

export function createWorldCommandQueueModule(): WorldCommandQueueModule {
    const queue: WorldCommand[] = [];

    function spawn(storeId: string, entity: Entity) {
        queue.push({
            type: "spawn",
            payload: {
                storeId,
                entity,
            },
        });
    }

    function destroy(storeId: string, entityId: EntityId) {
        queue.push({
            type: "destroy",
            payload: {
                storeId,
                entityId,
            },
        });
    }

    function flush(on: {
        spawn: (storeId: string, entity: Entity) => void;
        destroy: (storeId: string, entityId: EntityId) => void;
    }) {
        const pending = queue.splice(0); // wow
        for (const cmd of pending) {
            const { storeId } = cmd.payload;

            switch (cmd.type) {
                case "spawn":
                    const { entity } = cmd.payload;
                    if (entity) on.spawn(storeId, entity);
                    break;
                case "destroy":
                    const { entityId } = cmd.payload;
                    if (entityId) on.destroy(storeId, entityId);
                    break;
            }
        }
    }

    function clear() {
        queue.length = 0;
    }

    return {
        spawn,
        destroy,
        flush,
        clear,
    };
}
