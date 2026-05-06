import { createGame, entity, scene, system } from "./cluster/engine/game";

export default async () => {
    const log: string[] = [];
    let frameCallback: FrameRequestCallback | undefined;
    let nextFrameId = 1;

    const player = entity("demo.player", {
        position: { x: 0, y: 0 },
        velocity: { x: 1, y: 1 },
    });
    const storeId = "demo.game#1";

    const demoScene = scene({
        id: "demo.game",
        setup(ctx) {
            log.push("setup");
            ctx.addEntities(player);
            ctx.addSystems(
                system({
                    id: "demo.game.fixedUpdate",
                    execute(gameCtx, dt) {
                        log.push(`fixedUpdate:${dt}`);
                        gameCtx.world.commands.request.spawn(
                            entity("demo.spawned", {
                                position: { x: dt, y: dt },
                            }),
                        );
                        gameCtx.world.commands.request.destroy("demo.player");
                        log.push("destroy:demo.player");
                    },
                }),
            );
        },
    });

    const game = createGame({
        canvas: document.createElement("canvas"),
        initialScene: demoScene,
        platform: {
            requestFrame(callback) {
                frameCallback = callback;
                return nextFrameId++;
            },
            cancelFrame() {
                frameCallback = undefined;
            },
        },
        debug: true,
    });

    await game.start();

    frameCallback?.(1);
    frameCallback?.(18);

    const store = game.debug.world.stores.find(
        (snapshot) => snapshot.storeId === storeId,
    );
    const entityIds =
        store?.archetypes.flatMap((archetype) =>
            archetype.entities.map((snapshot) => snapshot.entityId),
        ) ?? [];
    const sceneStack = game.debug.sceneStack.instanceIds;

    await game.dispose();

    console.log("Game service demo metrics", {
        log,
        sceneStack,
        storeId,
        storeExists: Boolean(store),
        storeEntityCount: store?.entityCount ?? 0,
        entityIds,
        playerDestroyed: !entityIds.includes("demo.player"),
        spawnedCreated: entityIds.includes("demo.spawned"),
        setupRan: log.includes("setup"),
        fixedUpdateRan: log.some((entry) => entry.startsWith("fixedUpdate:")),
    });
};
