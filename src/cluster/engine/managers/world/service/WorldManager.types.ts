import type { Entity, EntityId } from "../entity";

export type WorldManagerSnapshot = {
    rev: number;
    changed: boolean;
    storeCount: number;
};

export type WorldManagerView = Readonly<WorldManagerSnapshot>;

export type WorldCommands = {
    readonly request: {
        spawn(storeId: string, entity: Entity): void;
        destroy(storeId: string, entityId: EntityId): void;
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
    view: WorldManagerView;
    commands: WorldCommands;
}>;
