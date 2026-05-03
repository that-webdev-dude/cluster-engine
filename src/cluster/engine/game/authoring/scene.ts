import type { GameAuthoredScene } from "../service/Game.types";

export type SceneConfig = GameAuthoredScene;

export function scene(config: SceneConfig): GameAuthoredScene {
    return Object.freeze({
        id: config.id,
        instanceId: config.instanceId,
        options: config.options,
        setup: config.setup,
    });
}
