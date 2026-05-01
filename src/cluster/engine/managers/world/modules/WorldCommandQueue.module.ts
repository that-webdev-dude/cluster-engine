import type { Entity, EntityId } from "../entity";

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

export type WorldCommandClear = {
    type: "clear";
};

export type WorldCommand =
    | WorldCommandSpawn
    | WorldCommandDestroy
    | WorldCommandClear;

export type WorldCommandQueueModule = {
    spawn(storeId: string, entity: Entity): void;
    destroy(storeId: string, entityId: EntityId): void;
    clear(): void;
    flush(on: {
        spawn: (storeId: string, entity: Entity) => void;
        destroy: (storeId: string, entityId: EntityId) => void;
        clear: () => void;
    }): void;
    reset(): void;
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

    function clear() {
        queue.push({
            type: "clear",
        });
    }

    function flush(on: {
        spawn: (storeId: string, entity: Entity) => void;
        destroy: (storeId: string, entityId: EntityId) => void;
        clear: () => void;
    }) {
        const pending = queue.splice(0);
        for (const cmd of pending) {
            switch (cmd.type) {
                case "spawn":
                    on.spawn(cmd.payload.storeId, cmd.payload.entity);
                    break;
                case "destroy":
                    on.destroy(cmd.payload.storeId, cmd.payload.entityId);
                    break;
                case "clear":
                    on.clear();
                    break;
            }
        }
    }

    function reset() {
        queue.length = 0;
    }

    return {
        spawn,
        destroy,
        clear,
        flush,
        reset,
    };
}
