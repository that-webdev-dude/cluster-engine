export {
    createGame,
    startGame,
    type Game,
    type GameConfig,
} from "./service/Game.service";
export {
    entity,
    type EntityComponentConfig,
    type EntityComponentsConfig,
    type EntityConfig,
} from "./authoring/entity";
export { scene, type SceneConfig } from "./authoring/scene";
export { system, type SystemConfig } from "./authoring/system";
export type {
    GameAuthoredScene,
    GameAuthoredSceneSetupCtx,
    GameCtx,
    GameEntity,
    GameRun,
    GameSceneCommands,
    GameSystem,
    GameWorldCommands,
} from "./service/Game.types";
