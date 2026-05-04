import type { Entity, EntityId } from "../entity";
import type {
    WorldDebugSnapshot,
    WorldQueryRow,
    WorldStoreId,
} from "../modules/WorldStorage.module";

export type WorldManagerQueryRow = WorldQueryRow;

export type WorldManagerSnapshot = {
    rev: number;
    changed: boolean;
    storeCount: number;
    entityCount: number;
    debug: WorldDebugSnapshot;
};

export type WorldManagerView = Readonly<WorldManagerSnapshot>;

export type WorldCommands = {
    readonly request: {
        spawn(storeId: WorldStoreId, entity: Entity): void;
        destroy(storeId: WorldStoreId, entityId: EntityId): void;
        clearStore(storeId: WorldStoreId): void;
        clear(): void;
    };
};

export type WorldManagerConfig = Readonly<{
    debug?: boolean;
}>;

export type WorldManagerService = Readonly<{
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    dispose(): Promise<boolean>;
    publish(): void;
    flush(): void;
    query(
        storeId: WorldStoreId,
        componentNames: readonly string[],
    ): readonly WorldQueryRow[];
    view: WorldManagerView;
    commands: WorldCommands;
}>;
