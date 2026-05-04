import type { Entity, EntityId } from "../entity";
import type { Storage } from "../storage/storage";
import type { ComponentPrimitive, ComponentSchema } from "../storage/types/component";

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

export type WorldQueryField = Readonly<{
    read(): ComponentPrimitive;
    write(value: ComponentPrimitive): void;
}>;

export type WorldQueryRow = Readonly<{
    entityId: EntityId;
    storeId: WorldStoreId;
    archetypeId: ArchetypeId;
    components: Readonly<
        Record<string, Readonly<Record<string, WorldQueryField>>>
    >;
}>;

export type WorldDebugEntitySnapshot = Readonly<{
    entityId: EntityId;
    archetypeId: ArchetypeId;
    components: Readonly<
        Record<string, Readonly<Record<string, ComponentPrimitive>>>
    >;
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

export type ComponentInput = Record<string, ComponentPrimitive>;

export type ParsedEntity = Readonly<{
    entityId: EntityId;
    archetypeId: ArchetypeId;
    componentNames: readonly string[];
    components: Record<string, ComponentInput>;
}>;

export type WorldStore = {
    archetypes: Map<ArchetypeId, Storage<ComponentSchema>>;
    entities: Map<EntityId, WorldEntityRecord>;
};
