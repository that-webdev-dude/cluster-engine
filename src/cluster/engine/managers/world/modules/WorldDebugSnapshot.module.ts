import type { EntityId } from "../entity";
import type {
    Archetype,
    ComponentPrimitive,
    ComponentSchema,
} from "../storage/types/component";
import { Storage } from "../storage/storage";
import type {
    ArchetypeId,
    WorldDebugArchetypeSnapshot,
    WorldDebugEntitySnapshot,
    WorldDebugSnapshot,
    WorldDebugStoreSnapshot,
    WorldStore,
    WorldStoreId,
} from "./WorldStorage.types";

export type WorldDebugSnapshotRowLookup = (
    store: WorldStore,
    archetypeId: ArchetypeId,
    chunkId: number,
    row: number,
) => EntityId | undefined;

export function createWorldDebugSnapshot(
    stores: Iterable<[WorldStoreId, WorldStore]>,
    findEntityIdAtRow: WorldDebugSnapshotRowLookup,
): WorldDebugSnapshot {
    const storeSnapshots = Array.from(stores)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([storeId, store]) =>
            createStoreSnapshot(storeId, store, findEntityIdAtRow),
        );

    return deepFreeze({
        storeCount: storeSnapshots.length,
        entityCount: storeSnapshots.reduce(
            (count, store) => count + store.entityCount,
            0,
        ),
        stores: storeSnapshots,
    });
}

function createStoreSnapshot(
    storeId: WorldStoreId,
    store: WorldStore,
    findEntityIdAtRow: WorldDebugSnapshotRowLookup,
): WorldDebugStoreSnapshot {
    const archetypes = Array.from(store.archetypes.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([archetypeId, storage]) =>
            createArchetypeSnapshot(
                store,
                archetypeId,
                storage,
                findEntityIdAtRow,
            ),
        );

    return {
        storeId,
        entityCount: store.entities.size,
        archetypes,
    };
}

function createArchetypeSnapshot(
    store: WorldStore,
    archetypeId: ArchetypeId,
    storage: Storage<ComponentSchema>,
    findEntityIdAtRow: WorldDebugSnapshotRowLookup,
): WorldDebugArchetypeSnapshot {
    const componentNames = Array.from(
        storage.archetype.descriptors.byName.keys(),
    ).sort();
    const entities: WorldDebugEntitySnapshot[] = [];

    for (const chunk of storage) {
        for (let row = 0; row < chunk.count; row++) {
            const entityId = findEntityIdAtRow(
                store,
                archetypeId,
                chunk.id,
                row,
            );
            if (!entityId) continue;

            entities.push({
                entityId,
                archetypeId,
                components: copyComponents(
                    chunk.components as Record<
                        string,
                        Record<
                            string,
                            (
                                row: number,
                                value?: ComponentPrimitive,
                            ) => ComponentPrimitive | void
                        >
                    >,
                    storage.archetype,
                    componentNames,
                    row,
                ),
            });
        }
    }

    entities.sort((left, right) => left.entityId.localeCompare(right.entityId));

    return {
        archetypeId,
        componentNames,
        entities,
    };
}

function copyComponents(
    components: Record<
        string,
        Record<
            string,
            (row: number, value?: ComponentPrimitive) => ComponentPrimitive | void
        >
    >,
    archetype: Archetype<ComponentSchema>,
    componentNames: readonly string[],
    row: number,
): Readonly<Record<string, Readonly<Record<string, ComponentPrimitive>>>> {
    const result: Record<string, Readonly<Record<string, ComponentPrimitive>>> =
        Object.create(null);

    for (const componentName of componentNames) {
        const descriptor = archetype.descriptors.byName.get(componentName);
        const source = components[componentName];
        if (!descriptor || !source) continue;

        const fields: Record<string, ComponentPrimitive> = Object.create(null);
        for (const fieldName of Array.from(descriptor.fields).sort()) {
            fields[fieldName] = source[fieldName](row) as ComponentPrimitive;
        }

        result[componentName] = Object.freeze(fields);
    }

    return Object.freeze(result);
}

function deepFreeze<T>(value: T): T {
    if (!value || typeof value !== "object") return value;

    Object.freeze(value);
    for (const child of Object.values(value)) {
        if (child && typeof child === "object" && !Object.isFrozen(child)) {
            deepFreeze(child);
        }
    }

    return value;
}
