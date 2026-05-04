import type { Entity, EntityId } from "../entity";
import type { ComponentConfigMap, ComponentSchema } from "../storage/types/component";
import {
    assertEntityId,
    assertStoreId,
    parseEntity,
    validateArchetypeFields,
} from "./WorldEntitySchema.module";
import { createWorldDebugSnapshot } from "./WorldDebugSnapshot.module";
import { createWorldQueryRows } from "./WorldQuery.module";
import { createWorldStoreIndex } from "./WorldStoreIndex.module";
import type {
    WorldDestroyResult,
    WorldEntityRecord,
    WorldQueryRow,
    WorldStorageConfig,
    WorldStorageModule,
    WorldStoreId,
} from "./WorldStorage.types";

export type {
    ArchetypeId,
    WorldDebugArchetypeSnapshot,
    WorldDebugEntitySnapshot,
    WorldDebugSnapshot,
    WorldDebugStoreSnapshot,
    WorldDestroyResult,
    WorldEntityRecord,
    WorldQueryField,
    WorldQueryRow,
    WorldStorageConfig,
    WorldStorageModule,
    WorldStoreId,
} from "./WorldStorage.types";

export function createWorldStorageModule(
    config?: WorldStorageConfig,
): WorldStorageModule {
    const debug = config?.debug ?? false;
    const storeIndex = createWorldStoreIndex();

    function spawn(
        storeId: WorldStoreId,
        entity: Entity,
    ): WorldEntityRecord {
        assertStoreId(storeId);

        const parsed = parseEntity(entity);
        const store = storeIndex.getOrCreate(storeId);
        if (store.entities.has(parsed.entityId)) {
            throw new Error(
                `WorldStorage.spawn: duplicate entity id ${parsed.entityId} in store ${storeId}`,
            );
        }

        const storage = storeIndex.getOrCreateArchetypeStorage(store, parsed);
        validateArchetypeFields(storage.archetype, parsed);

        const meta = storage.allocate(
            parsed.components as ComponentConfigMap<ComponentSchema>,
        );
        const record = storeIndex.createEntityRecord(
            storeId,
            parsed.entityId,
            meta,
        );
        store.entities.set(parsed.entityId, record);

        return record;
    }

    function destroy(
        storeId: WorldStoreId,
        entityId: EntityId,
    ): WorldDestroyResult {
        assertStoreId(storeId);
        assertEntityId(entityId);

        const store = storeIndex.get(storeId);
        if (!store) return handleMissingDestroy(storeId, entityId);

        const record = store.entities.get(entityId);
        if (!record) return handleMissingDestroy(storeId, entityId);

        const storage = store.archetypes.get(record.archetypeId);
        if (!storage) return handleMissingDestroy(storeId, entityId);

        const movedEntityId = storeIndex.findEntityAtRow(
            store,
            record.archetypeId,
            record.chunkId,
            record.row,
        );
        const result = storage.delete(
            record.chunkId,
            record.row,
            record.generation,
        );

        if (!result) return { destroyed: false };

        store.entities.delete(entityId);

        let moved: WorldEntityRecord | undefined;
        if (result.movedRow !== undefined && movedEntityId !== undefined) {
            moved = storeIndex.createEntityRecord(
                storeId,
                movedEntityId,
                result.meta,
            );
            store.entities.set(movedEntityId, moved);
        }

        if (storage.isEmpty) {
            store.archetypes.delete(record.archetypeId);
        }
        if (store.entities.size === 0) {
            storeIndex.deleteStore(storeId);
        }

        return moved ? { destroyed: true, moved } : { destroyed: true };
    }

    function clearStore(storeId: WorldStoreId): boolean {
        assertStoreId(storeId);
        return storeIndex.clearStore(storeId);
    }

    function clear(): void {
        storeIndex.clear();
    }

    function getStoreIds(): readonly WorldStoreId[] {
        return storeIndex.getStoreIds();
    }

    function getStoreCount(): number {
        return storeIndex.getStoreCount();
    }

    function getEntityCount(storeId?: WorldStoreId): number {
        return storeIndex.getEntityCount(storeId);
    }

    function query(
        storeId: WorldStoreId,
        componentNames: readonly string[],
    ): readonly WorldQueryRow[] {
        assertStoreId(storeId);
        return createWorldQueryRows(
            storeId,
            storeIndex.get(storeId),
            componentNames,
            storeIndex.findEntityIdAtRow,
            storeIndex.isCurrentEntityRecord,
        );
    }

    function createDebugSnapshot() {
        return createWorldDebugSnapshot(
            storeIndex.entries(),
            storeIndex.findEntityIdAtRow,
        );
    }

    function handleMissingDestroy(
        storeId: WorldStoreId,
        entityId: EntityId,
    ): WorldDestroyResult {
        if (debug) {
            throw new Error(
                `WorldStorage.destroy: entity ${entityId} not found in store ${storeId}`,
            );
        }

        return { destroyed: false };
    }

    return {
        spawn,
        destroy,
        clearStore,
        clear,
        getStoreIds,
        getStoreCount,
        getEntityCount,
        query,
        createDebugSnapshot,
        dispose: clear,
    };
}
