import type {
    GameAuthoredScene,
    GameRuntimeScene,
} from "../service/Game.types";
import type { Entity } from "../../managers/world";

export type AuthoredSceneAdapterDeps = Readonly<{
    spawnEntity(storeId: string, entity: Entity): void;
}>;

export type AuthoredSceneAdapter = Readonly<{
    toRuntimeScene(authoredScene: GameAuthoredScene): GameRuntimeScene;
}>;

export function createAuthoredSceneAdapter(
    deps: AuthoredSceneAdapterDeps,
): AuthoredSceneAdapter {
    function toRuntimeScene(
        authoredScene: GameAuthoredScene,
    ): GameRuntimeScene {
        const instanceId = authoredScene.instanceId ?? authoredScene.id;

        return {
            id: authoredScene.id,
            instanceId,
            policy: authoredScene.options,
            onMount(runtimeCtx) {
                return authoredScene.setup({
                    addSystems(...systems) {
                        runtimeCtx.addSystems(...systems);
                    },
                    addEntities(...entities) {
                        for (const entity of entities) {
                            deps.spawnEntity(instanceId, entity);
                        }
                    },
                });
            },
        };
    }

    return Object.freeze({
        toRuntimeScene,
    });
}
