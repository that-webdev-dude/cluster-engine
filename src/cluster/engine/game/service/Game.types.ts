import { EnginePlatform } from "../../types/patform";
import { Scene, ScenePolicy } from "../../managers/scene";
import { Entity } from "../../managers/world";
import { System } from "../../types/system";

export type GameSceneCommands = {
    request: {
        set(scene: GameAuthoredScene): void;
        push(scene: GameAuthoredScene): void;
        pop(): void;
    };
};

export type GameWorldCommands = {
    request: {
        spawn(storeId: string, entity: Entity): void;
        destroy(storeId: string, entityId: string): void;
        clear(): void;
    };
};

export type GameCtx = {
    scene: GameSceneCommands;
    world: GameWorldCommands;
};

export type GameRun = number;

export type GameEntity = Entity;

export type GameSystem = System<GameCtx, GameRun>;

export type GameRuntimeScene = Scene<GameCtx, GameRun>;

export type GameAuthoredSceneSetupCtx = {
    addSystem(system: GameSystem): void;
    addEntity(entity: GameEntity): void;
};

export type GameAuthoredScene = {
    id: string;
    instanceId?: string;
    policy?: ScenePolicy;
    setup(sceneSetupCtx: GameAuthoredSceneSetupCtx): void | (() => void);
};

export type GamePlatform = EnginePlatform;
