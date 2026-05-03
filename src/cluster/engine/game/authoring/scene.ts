import type { GameAuthoredScene } from "../service/Game.types";

export type SceneConfig = GameAuthoredScene;

export function scene(config: SceneConfig): GameAuthoredScene {
    return Object.freeze({
        id: config.id,
        instanceId: config.instanceId,
        policy: config.policy,
        setup: config.setup,
    });
}
