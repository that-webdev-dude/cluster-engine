import { EnginePlatform } from "../../types/patform";
import { Scene, ScenePolicy, SceneManagerView } from "../../managers/scene";
import {
    Entity,
    WorldManagerView,
    WorldManagerQueryRow,
} from "../../managers/world";
import type { DisplayView } from "../../services/display";
import type { InputView } from "../../services/input";
import type { RenderView } from "../../services/render";
import { System } from "../../systems";

export type GameSceneCommands = {
    request: {
        set(scene: GameAuthoredScene): void;
        push(scene: GameAuthoredScene): void;
        pop(): void;
    };
};

export type GameWorldCommands = {
    request: {
        spawn(entity: Entity): void;
        destroy(entityId: string): void;
        clear(): void;
    };
};

export type GameWorldQuery = (
    componemtnNames: readonly string[],
) => readonly WorldManagerQueryRow[];

export type GameCtx = {
    display: DisplayView;
    input: InputView;
    scene: GameSceneCommands;
    world: {
        query: GameWorldQuery;
        commands: GameWorldCommands;
    };
};

export type GameRun = number;

export type GameEntity = Entity;

export type GameSystem = System<GameCtx, GameRun>;

export type GameRuntimeScene = Scene<GameCtx, GameRun>;

export type GameAuthoredSceneSetupCtx = {
    addSystems(...systems: GameSystem[]): void;
    addEntities(...entities: GameEntity[]): void;
};

export type GameAuthoredScene = {
    id: string;
    options?: ScenePolicy;
    setup(sceneSetupCtx: GameAuthoredSceneSetupCtx): void | (() => void);
};

export type GamePlatform = EnginePlatform;

export type GameDebugView = Readonly<{
    sceneStack: SceneManagerView["stack"];
    world: WorldManagerView["debug"];
    render: RenderView;
}>;
