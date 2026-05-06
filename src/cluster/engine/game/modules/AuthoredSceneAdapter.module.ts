import type {
    GameAuthoredScene,
    GameRuntimeScene,
} from "../service/Game.types";
import type { Entity } from "../../managers/world";
import { resolveSceneInstanceId } from "../../managers/scene/tools";

export type AuthoredSceneAdapterDeps = Readonly<{
    spawnEntity(storeId: string, entity: Entity): void;
    clearStore(storeId: string): void;
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
        const instanceId = resolveSceneInstanceId(authoredScene); // for now instanceId is equal to id.

        return {
            id: authoredScene.id,
            instanceId,
            policy: authoredScene.options,
            onMount(runtimeCtx) {
                const authoredCleanup = authoredScene.setup({
                    addSystems(...systems) {
                        runtimeCtx.addSystems(...systems);
                    },
                    addEntities(...entities) {
                        for (const entity of entities) {
                            deps.spawnEntity(instanceId, entity);
                        }
                    },
                });

                return () => {
                    try {
                        if (typeof authoredCleanup === "function") {
                            authoredCleanup();
                        }
                    } finally {
                        deps.clearStore(instanceId);
                    }
                };
            },
        };
    }

    return Object.freeze({
        toRuntimeScene,
    });
}
