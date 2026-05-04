import type { EntityId } from "../entity";
import { Storage } from "../storage/storage";
import type { ComponentSchema } from "../storage/types/component";
import type { EntityMeta } from "../storage/types/entity";
import { createArchetype } from "./WorldEntitySchema.module";
import type {
    ArchetypeId,
    ParsedEntity,
    WorldEntityRecord,
    WorldStore,
    WorldStoreId,
} from "./WorldStorage.types";

export type WorldStoreIndex = Readonly<{
    entries(): IterableIterator<[WorldStoreId, WorldStore]>;
    get(storeId: WorldStoreId): WorldStore | undefined;
    getOrCreate(storeId: WorldStoreId): WorldStore;
    deleteStore(storeId: WorldStoreId): boolean;
    clearStore(storeId: WorldStoreId): boolean;
    clear(): void;
    getStoreIds(): readonly WorldStoreId[];
    getStoreCount(): number;
    getEntityCount(storeId?: WorldStoreId): number;
    getOrCreateArchetypeStorage(
        store: WorldStore,
        parsed: ParsedEntity,
    ): Storage<ComponentSchema>;
    createEntityRecord(
        storeId: WorldStoreId,
        entityId: EntityId,
        meta: EntityMeta<ComponentSchema>,
    ): WorldEntityRecord;
    findEntityAtRow(
        store: WorldStore,
        archetypeId: ArchetypeId,
        chunkId: number,
        deletedRow: number,
    ): EntityId | undefined;
    findEntityIdAtRow(
        store: WorldStore,
        archetypeId: ArchetypeId,
        chunkId: number,
        row: number,
    ): EntityId | undefined;
    isCurrentEntityRecord(
        store: WorldStore,
        record: WorldEntityRecord,
    ): boolean;
}>;

export function createWorldStoreIndex(): WorldStoreIndex {
    const stores = new Map<WorldStoreId, WorldStore>();

    function entries(): IterableIterator<[WorldStoreId, WorldStore]> {
        return stores.entries();
    }

    function get(storeId: WorldStoreId): WorldStore | undefined {
        return stores.get(storeId);
    }

    function getOrCreate(storeId: WorldStoreId): WorldStore {
        let store = stores.get(storeId);
        if (!store) {
            store = {
                archetypes: new Map(),
                entities: new Map(),
            };
            stores.set(storeId, store);
        }
        return store;
    }

    function deleteStore(storeId: WorldStoreId): boolean {
        return stores.delete(storeId);
    }

    function clearStore(storeId: WorldStoreId): boolean {
        const store = stores.get(storeId);
        if (!store) return false;

        clearWorldStore(store);
        stores.delete(storeId);

        return true;
    }

    function clear(): void {
        for (const store of stores.values()) {
            clearWorldStore(store);
        }
        stores.clear();
    }

    function getStoreIds(): readonly WorldStoreId[] {
        return Array.from(stores.keys());
    }

    function getStoreCount(): number {
        return stores.size;
    }

    function getEntityCount(storeId?: WorldStoreId): number {
        if (storeId !== undefined) {
            return stores.get(storeId)?.entities.size ?? 0;
        }

        let count = 0;
        for (const store of stores.values()) {
            count += store.entities.size;
        }
        return count;
    }

    function getOrCreateArchetypeStorage(
        store: WorldStore,
        parsed: ParsedEntity,
    ): Storage<ComponentSchema> {
        const existing = store.archetypes.get(parsed.archetypeId);
        if (existing) return existing;

        const storage = new Storage(createArchetype(parsed));
        store.archetypes.set(parsed.archetypeId, storage);
        return storage;
    }

    function createEntityRecord(
        storeId: WorldStoreId,
        entityId: EntityId,
        meta: EntityMeta<ComponentSchema>,
    ): WorldEntityRecord {
        return {
            entityId,
            storeId,
            archetypeId: meta.archetype.name,
            chunkId: meta.chunkId,
            row: meta.row,
            generation: meta.generation,
        };
    }

    function findEntityAtRow(
        store: WorldStore,
        archetypeId: ArchetypeId,
        chunkId: number,
        deletedRow: number,
    ): EntityId | undefined {
        let movedEntityId: EntityId | undefined;
        let maxRow = -1;

        for (const record of store.entities.values()) {
            if (
                record.archetypeId !== archetypeId ||
                record.chunkId !== chunkId ||
                record.row === deletedRow
            ) {
                continue;
            }

            if (record.row > maxRow) {
                maxRow = record.row;
                movedEntityId = record.entityId;
            }
        }

        return movedEntityId;
    }

    function findEntityIdAtRow(
        store: WorldStore,
        archetypeId: ArchetypeId,
        chunkId: number,
        row: number,
    ): EntityId | undefined {
        for (const record of store.entities.values()) {
            if (
                record.archetypeId === archetypeId &&
                record.chunkId === chunkId &&
                record.row === row
            ) {
                return record.entityId;
            }
        }

        return undefined;
    }

    function isCurrentEntityRecord(
        store: WorldStore,
        record: WorldEntityRecord,
    ): boolean {
        const current = store.entities.get(record.entityId);
        return (
            current?.storeId === record.storeId &&
            current.archetypeId === record.archetypeId &&
            current.chunkId === record.chunkId &&
            current.row === record.row &&
            current.generation === record.generation
        );
    }

    return {
        entries,
        get,
        getOrCreate,
        deleteStore,
        clearStore,
        clear,
        getStoreIds,
        getStoreCount,
        getEntityCount,
        getOrCreateArchetypeStorage,
        createEntityRecord,
        findEntityAtRow,
        findEntityIdAtRow,
        isCurrentEntityRecord,
    };
}

function clearWorldStore(store: WorldStore): void {
    for (const storage of store.archetypes.values()) {
        storage.dispose();
    }
    store.archetypes.clear();
    store.entities.clear();
}
