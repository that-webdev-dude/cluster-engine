import type { Entity, EntityId } from "../entity";
import type {
    WorldDebugSnapshot,
    WorldQueryRow,
    WorldStoreId,
} from "../modules/WorldStorage.module";

export type WorldManagerSnapshot = {
    rev: number;
    changed: boolean;
    debug: WorldDebugSnapshot;
};

export type WorldManagerView = Readonly<WorldManagerSnapshot>;

export type WorldCommands = {
    readonly request: {
        spawn(storeId: WorldStoreId, entity: Entity): void;
        destroy(storeId: WorldStoreId, entityId: EntityId): void;
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
