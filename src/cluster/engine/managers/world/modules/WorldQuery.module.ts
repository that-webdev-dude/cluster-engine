import type { EntityId } from "../entity";
import type {
    Archetype,
    ComponentPrimitive,
    ComponentSchema,
} from "../storage/types/component";
import { assertComponentName } from "./WorldEntitySchema.module";
import type {
    ArchetypeId,
    WorldQueryFieldAccessor,
    WorldQueryRow,
    WorldStore,
    WorldStoreId,
} from "./WorldStorage.types";

export type WorldQueryRowLookup = (
    store: WorldStore,
    archetypeId: ArchetypeId,
    chunkId: number,
    row: number,
) => EntityId | undefined;

export function createWorldQueryRows(
    storeId: WorldStoreId,
    store: WorldStore | undefined,
    componentNames: readonly string[],
    findEntityIdAtRow: WorldQueryRowLookup,
): readonly WorldQueryRow[] {
    const requestedNames = normalizeComponentNames(componentNames);
    if (requestedNames.length === 0) return [];
    if (!store) return [];

    const rows: WorldQueryRow[] = [];
    for (const storage of store.archetypes.values()) {
        if (!archetypeContains(storage.archetype, requestedNames)) {
            continue;
        }

        for (const chunk of storage) {
            for (let row = 0; row < chunk.count; row++) {
                const entityId = findEntityIdAtRow(
                    store,
                    storage.archetype.name,
                    chunk.id,
                    row,
                );
                if (!entityId) continue;

                rows.push({
                    entityId,
                    storeId,
                    archetypeId: storage.archetype.name,
                    components: bindQueryComponents(
                        chunk.components,
                        storage.archetype,
                        requestedNames,
                        row,
                    ),
                });
            }
        }
    }

    return rows;
}

function normalizeComponentNames(
    componentNames: readonly string[],
): readonly string[] {
    const normalized = Array.from(new Set(componentNames)).sort();
    for (const componentName of normalized) {
        assertComponentName(componentName);
    }
    return normalized;
}

function archetypeContains(
    archetype: Archetype<ComponentSchema>,
    componentNames: readonly string[],
): boolean {
    for (const componentName of componentNames) {
        if (!archetype.descriptors.byName.has(componentName)) {
            return false;
        }
    }
    return true;
}

function bindQueryComponents(
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
): Readonly<Record<string, Readonly<Record<string, WorldQueryFieldAccessor>>>> {
    const result: Record<
        string,
        Readonly<Record<string, WorldQueryFieldAccessor>>
    > = Object.create(null);

    for (const componentName of componentNames) {
        const descriptor = archetype.descriptors.byName.get(componentName);
        const source = components[componentName];
        if (!descriptor || !source) continue;

        const fields: Record<string, WorldQueryFieldAccessor> =
            Object.create(null);
        for (const fieldName of descriptor.fields) {
            const accessor = source[fieldName];
            fields[fieldName] = ((value?: ComponentPrimitive) => {
                if (value === undefined) {
                    return accessor(row) as ComponentPrimitive;
                }
                accessor(row, value);
            }) as WorldQueryFieldAccessor;
        }

        result[componentName] = Object.freeze(fields);
    }

    return Object.freeze(result);
}
