import type { Entity, EntityId } from "../entity";
import { Storage } from "../storage/storage";
import type {
    Archetype,
    ComponentConfigMap,
    ComponentDescriptor,
    ComponentPrimitive,
    ComponentSchema,
} from "../storage/types/component";
import type { EntityMeta } from "../storage/types/entity";

export type WorldStoreId = string;

export type ArchetypeId = string;

export type WorldEntityRecord = Readonly<{
    entityId: EntityId;
    storeId: WorldStoreId;
    archetypeId: ArchetypeId;
    chunkId: number;
    row: number;
    generation: number;
}>;

export type WorldDestroyResult = Readonly<{
    destroyed: boolean;
    moved?: WorldEntityRecord;
}>;

export type WorldQueryFieldAccessor = {
    (): ComponentPrimitive;
    (value: ComponentPrimitive): void;
};

export type WorldQueryRow = Readonly<{
    entityId: EntityId;
    storeId: WorldStoreId;
    archetypeId: ArchetypeId;
    components: Readonly<
        Record<string, Readonly<Record<string, WorldQueryFieldAccessor>>>
    >;
}>;

export type WorldDebugEntitySnapshot = Readonly<{
    entityId: EntityId;
    archetypeId: ArchetypeId;
    components: Readonly<Record<string, Readonly<Record<string, ComponentPrimitive>>>>;
}>;

export type WorldDebugArchetypeSnapshot = Readonly<{
    archetypeId: ArchetypeId;
    componentNames: readonly string[];
    entities: readonly WorldDebugEntitySnapshot[];
}>;

export type WorldDebugStoreSnapshot = Readonly<{
    storeId: WorldStoreId;
    entityCount: number;
    archetypes: readonly WorldDebugArchetypeSnapshot[];
}>;

export type WorldDebugSnapshot = Readonly<{
    storeCount: number;
    entityCount: number;
    stores: readonly WorldDebugStoreSnapshot[];
}>;

export type WorldStorageConfig = Readonly<{
    debug?: boolean;
}>;

export type WorldStorageModule = {
    spawn(storeId: WorldStoreId, entity: Entity): WorldEntityRecord;
    destroy(storeId: WorldStoreId, entityId: EntityId): WorldDestroyResult;
    clearStore(storeId: WorldStoreId): boolean;
    clear(): void;
    getStoreIds(): readonly WorldStoreId[];
    getStoreCount(): number;
    getEntityCount(storeId?: WorldStoreId): number;
    query(
        storeId: WorldStoreId,
        componentNames: readonly string[],
    ): readonly WorldQueryRow[];
    createDebugSnapshot(): WorldDebugSnapshot;
    dispose(): void;
};

type ComponentInput = Record<string, ComponentPrimitive>;

type ParsedEntity = Readonly<{
    entityId: EntityId;
    archetypeId: ArchetypeId;
    componentNames: readonly string[];
    components: Record<string, ComponentInput>;
}>;

type WorldStore = {
    archetypes: Map<ArchetypeId, Storage<ComponentSchema>>;
    entities: Map<EntityId, WorldEntityRecord>;
};

export function createWorldStorageModule(
    config?: WorldStorageConfig,
): WorldStorageModule {
    const debug = config?.debug ?? false;
    const stores = new Map<WorldStoreId, WorldStore>();

    function spawn(
        storeId: WorldStoreId,
        entity: Entity,
    ): WorldEntityRecord {
        assertStoreId(storeId);

        const parsed = parseEntity(entity);
        const store = getOrCreateStore(storeId);
        if (store.entities.has(parsed.entityId)) {
            throw new Error(
                `WorldStorage.spawn: duplicate entity id ${parsed.entityId} in store ${storeId}`,
            );
        }

        const storage = getOrCreateArchetypeStorage(store, parsed);
        validateArchetypeFields(storage.archetype, parsed);

        const meta = storage.allocate(
            parsed.components as ComponentConfigMap<ComponentSchema>,
        );
        const record = createEntityRecord(storeId, parsed.entityId, meta);
        store.entities.set(parsed.entityId, record);

        return record;
    }

    function destroy(
        storeId: WorldStoreId,
        entityId: EntityId,
    ): WorldDestroyResult {
        assertStoreId(storeId);
        assertEntityId(entityId);

        const store = stores.get(storeId);
        if (!store) return handleMissingDestroy(storeId, entityId);

        const record = store.entities.get(entityId);
        if (!record) return handleMissingDestroy(storeId, entityId);

        const storage = store.archetypes.get(record.archetypeId);
        if (!storage) return handleMissingDestroy(storeId, entityId);

        const movedEntityId = findEntityAtRow(
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
            moved = createEntityRecord(storeId, movedEntityId, result.meta);
            store.entities.set(movedEntityId, moved);
        }

        if (storage.isEmpty) {
            store.archetypes.delete(record.archetypeId);
        }
        if (store.entities.size === 0) {
            stores.delete(storeId);
        }

        return moved ? { destroyed: true, moved } : { destroyed: true };
    }

    function clearStore(storeId: WorldStoreId): boolean {
        assertStoreId(storeId);

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

    function query(
        storeId: WorldStoreId,
        componentNames: readonly string[],
    ): readonly WorldQueryRow[] {
        assertStoreId(storeId);
        const requestedNames = normalizeComponentNames(componentNames);
        if (requestedNames.length === 0) return [];

        const store = stores.get(storeId);
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

    function createDebugSnapshot(): WorldDebugSnapshot {
        const storeSnapshots = Array.from(stores.entries())
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([storeId, store]) => createStoreSnapshot(storeId, store));

        return deepFreeze({
            storeCount: storeSnapshots.length,
            entityCount: storeSnapshots.reduce(
                (count, store) => count + store.entityCount,
                0,
            ),
            stores: storeSnapshots,
        });
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

    function getOrCreateStore(storeId: WorldStoreId): WorldStore {
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
}

function parseEntity(entity: Entity): ParsedEntity {
    if (!entity || typeof entity !== "object" || Array.isArray(entity)) {
        throw new TypeError("WorldStorage.spawn: entity must be an object");
    }

    assertEntityId(entity.id);

    const components: Record<string, ComponentInput> = Object.create(null);
    const componentNames = Object.keys(entity)
        .filter((name) => name !== "id")
        .sort();

    if (componentNames.length === 0) {
        throw new Error(
            `WorldStorage.spawn: entity ${entity.id} must include at least one component`,
        );
    }

    for (const componentName of componentNames) {
        assertComponentName(componentName);
        components[componentName] = parseComponent(
            entity.id,
            componentName,
            entity[componentName],
        );
    }

    return {
        entityId: entity.id,
        archetypeId: componentNames.join("|"),
        componentNames,
        components,
    };
}

function parseComponent(
    entityId: EntityId,
    componentName: string,
    value: unknown,
): ComponentInput {
    if (!isPlainRecord(value)) {
        throw new TypeError(
            `WorldStorage.spawn: component ${componentName} on entity ${entityId} must be a plain object`,
        );
    }

    const parsed: ComponentInput = Object.create(null);
    const fieldNames = Object.keys(value).sort();
    if (fieldNames.length === 0) {
        throw new Error(
            `WorldStorage.spawn: component ${componentName} on entity ${entityId} must include at least one field`,
        );
    }

    for (const fieldName of fieldNames) {
        assertFieldName(componentName, fieldName);

        const fieldValue = value[fieldName];
        if (!isComponentPrimitive(fieldValue)) {
            throw new TypeError(
                `WorldStorage.spawn: field ${componentName}.${fieldName} on entity ${entityId} must be a finite number or string`,
            );
        }
        parsed[fieldName] = fieldValue;
    }

    return parsed;
}

function createArchetype(parsed: ParsedEntity): Archetype<ComponentSchema> {
    const schema = parsed.componentNames.map((componentName) => {
        const fields = Object.create(null) as Record<string, number>;
        Object.keys(parsed.components[componentName]).forEach(
            (fieldName, index) => {
                fields[fieldName] = index;
            },
        );
        return {
            name: componentName,
            fields,
        };
    });

    const byName = new Map<string, ComponentDescriptor>();
    const byType = new Map<number, ComponentDescriptor>();
    const offsets = new Map<number, number>();

    schema.forEach((component, index) => {
        const fieldNames = Object.keys(component.fields);
        const defaults = fieldNames.map((fieldName) =>
            defaultFor(parsed.components[component.name][fieldName]),
        );
        const descriptor: ComponentDescriptor = {
            type: index,
            name: component.name,
            count: fieldNames.length,
            defaults,
            fields: new Set(fieldNames),
        };

        byName.set(component.name, descriptor);
        byType.set(index, descriptor);
        offsets.set(index, 0);
    });

    return {
        descriptors: {
            byName,
            byType,
        },
        offsets,
        types: schema.map((_, index) => index),
        name: parsed.archetypeId,
        schema,
        signature: signatureFor(parsed.archetypeId),
        byteStride: 0,
        elementStride: schema.length,
    };
}

function validateArchetypeFields(
    archetype: Archetype<ComponentSchema>,
    parsed: ParsedEntity,
): void {
    for (const componentName of parsed.componentNames) {
        const descriptor = archetype.descriptors.byName.get(componentName);
        if (!descriptor) {
            throw new Error(
                `WorldStorage.spawn: component ${componentName} is not part of archetype ${parsed.archetypeId}`,
            );
        }

        const fieldNames = Object.keys(parsed.components[componentName]).sort();
        const descriptorFields = Array.from(descriptor.fields).sort();
        if (!sameStrings(fieldNames, descriptorFields)) {
            throw new Error(
                `WorldStorage.spawn: component ${componentName} fields do not match archetype ${parsed.archetypeId}`,
            );
        }
    }
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
    components: Record<string, Record<string, (row: number, value?: ComponentPrimitive) => ComponentPrimitive | void>>,
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

function createStoreSnapshot(
    storeId: WorldStoreId,
    store: WorldStore,
): WorldDebugStoreSnapshot {
    const archetypes = Array.from(store.archetypes.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([archetypeId, storage]) =>
            createArchetypeSnapshot(storeId, store, archetypeId, storage),
        );

    return {
        storeId,
        entityCount: store.entities.size,
        archetypes,
    };
}

function createArchetypeSnapshot(
    storeId: WorldStoreId,
    store: WorldStore,
    archetypeId: ArchetypeId,
    storage: Storage<ComponentSchema>,
): WorldDebugArchetypeSnapshot {
    const componentNames = Array.from(storage.archetype.descriptors.byName.keys()).sort();
    const entities: WorldDebugEntitySnapshot[] = [];

    for (const chunk of storage) {
        for (let row = 0; row < chunk.count; row++) {
            const entityId = findEntityIdAtRow(store, archetypeId, chunk.id, row);
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

function clearWorldStore(store: WorldStore): void {
    for (const storage of store.archetypes.values()) {
        storage.dispose();
    }
    store.archetypes.clear();
    store.entities.clear();
}

function assertStoreId(storeId: WorldStoreId): void {
    if (typeof storeId !== "string" || storeId.trim().length === 0) {
        throw new Error("WorldStorage: storeId must be a non-empty string");
    }
}

function assertEntityId(entityId: EntityId): void {
    if (typeof entityId !== "string" || entityId.trim().length === 0) {
        throw new Error("WorldStorage: entityId must be a non-empty string");
    }
}

function assertComponentName(componentName: string): void {
    if (componentName.trim().length === 0) {
        throw new Error("WorldStorage: component name must be non-empty");
    }
}

function assertFieldName(componentName: string, fieldName: string): void {
    if (fieldName.trim().length === 0) {
        throw new Error(
            `WorldStorage: field name for component ${componentName} must be non-empty`,
        );
    }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function isComponentPrimitive(value: unknown): value is ComponentPrimitive {
    if (typeof value === "string") return true;
    return typeof value === "number" && Number.isFinite(value);
}

function defaultFor(value: ComponentPrimitive): ComponentPrimitive {
    return typeof value === "string" ? "" : 0;
}

function sameStrings(
    left: readonly string[],
    right: readonly string[],
): boolean {
    if (left.length !== right.length) return false;
    for (let index = 0; index < left.length; index++) {
        if (left[index] !== right[index]) return false;
    }
    return true;
}

function signatureFor(archetypeId: ArchetypeId): bigint {
    let hash = 0n;
    for (let index = 0; index < archetypeId.length; index++) {
        hash = (hash * 31n + BigInt(archetypeId.charCodeAt(index))) & 0xffffn;
    }
    return hash;
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
