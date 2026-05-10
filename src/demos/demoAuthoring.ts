import type { Scene } from "../cluster/engine/managers/scene";
import type { System } from "../cluster/engine/systems";
import type { Entity } from "../cluster/engine/managers/world/entity";

type GameRun = number;

type GameCtx = {};

type GameScene = Scene<GameCtx, GameRun>;

type GameSceneSetupCtx = {
    addSystem(system: System<GameCtx, GameRun>): void;
    addEntity(entity: Entity): void;
};

type GameSceneConfig = {
    id: string;
    instanceId?: string;
    setup(sceneSetupCtx: GameSceneSetupCtx): void | (() => void);
};

type SceneAuthoringDeps = {
    spawnEntity(storeId: string, entity: Entity): void;
};

function createSceneAuthoring(deps: SceneAuthoringDeps) {
    return function scene(config: GameSceneConfig): GameScene {
        const instanceId = config.instanceId ?? config.id;

        return {
            id: config.id,
            instanceId,
            onMount(runtimeCtx) {
                return config.setup({
                    addSystem(system) {
                        runtimeCtx.addSystems(system);
                    },
                    addEntity(entity) {
                        deps.spawnEntity(instanceId, entity);
                    },
                });
            },
        };
    };
}

const scene = createSceneAuthoring({
    spawnEntity(storeId, entity) {
        console.log("Queue entity spawn", { storeId, entity });
    },
});

const demoScene = scene({
    id: "demo",
    setup(ctx) {
        ctx.addSystem({
            id: "demo.system",
            phase: "update",
            order: 0,
            group: "main",
            groupOrder: 0,
            execute() {
                console.log("Hello, World!");
            },
        });
        ctx.addEntity({
            id: "demo.player",
            position: { x: 0, y: 0 },
            velocity: { x: 1, y: 1 },
        });
    },
});

console.log("Authored scene", demoScene);
