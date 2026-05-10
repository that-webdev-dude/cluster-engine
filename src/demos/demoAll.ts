import { createSceneManager } from "../cluster/engine/managers/scene/Scene.manager";
import type { Scene } from "../cluster/engine/managers/scene/Scene.types";
import type { System } from "../cluster/engine/systems";
import { createWorldManager } from "../cluster/engine/managers/world/World.manager";
import type { WorldManager } from "../cluster/engine/managers/world/World.manager";

type DemoAllCtx = {
    log: string[];
    storeId: string;
    world: WorldManager;
};

type DemoAllRun = {
    dt: number;
};

const sceneInstanceId = "demo.level#1";
const storeId = sceneInstanceId;
const entityIds = ["demo.player", "demo.enemy"] as const;

function createMovementSystem(): System<DemoAllCtx, DemoAllRun> {
    return {
        id: "demo.level.movement",
        phase: "update",
        order: 0,
        group: "simulation",
        groupOrder: 0,
        execute(ctx, run) {
            const rows = ctx.world.query(ctx.storeId, ["position", "velocity"]);

            for (const row of rows) {
                const position = row.components.position;
                const velocity = row.components.velocity;
                const nextX =
                    Number(position.x.read()) +
                    Number(velocity.x.read()) * run.dt;
                const nextY =
                    Number(position.y.read()) +
                    Number(velocity.y.read()) * run.dt;

                position.x.write(nextX);
                position.y.write(nextY);
                ctx.log.push(`${row.entityId}:position(${nextX},${nextY})`);
            }
        },
    };
}

export default async () => {
    const sceneManager = createSceneManager<DemoAllCtx, DemoAllRun>({
        debug: true,
    });
    const worldManager = createWorldManager({
        debug: true,
    });
    const ctx: DemoAllCtx = {
        log: [],
        storeId,
        world: worldManager,
    };
    let mountCount = 0;
    let cleanupCount = 0;

    const scene: Scene<DemoAllCtx, DemoAllRun> = {
        id: "demo.level",
        instanceId: sceneInstanceId,
        onMount(sceneCtx) {
            mountCount += 1;
            sceneCtx.addSystems(createMovementSystem());

            worldManager.commands.request.spawn(storeId, {
                id: "demo.player",
                position: { x: 20, y: 40 },
                velocity: { x: 1, y: 0 },
            });
            worldManager.commands.request.spawn(storeId, {
                id: "demo.enemy",
                position: { x: 100, y: 80 },
                velocity: { x: -2, y: 0.5 },
            });

            return () => {
                cleanupCount += 1;
                for (const entityId of entityIds) {
                    worldManager.commands.request.destroy(storeId, entityId);
                }
            };
        },
    };

    await sceneManager.start();
    await worldManager.start();

    sceneManager.commands.request.set(scene);
    sceneManager.execute({ pass: "update", ctx, run: { dt: 16 } });
    worldManager.publish();

    const beforeFlushMetrics = {
        sceneStackCount: sceneManager.view.stack.instanceIds.length,
        worldEntityCount: worldManager.view.debug.entityCount,
        executedSystems: ctx.log.length,
    };

    sceneManager.flush();
    worldManager.flush();
    worldManager.publish();

    const mountedStore = worldManager.view.debug.stores.find(
        (snapshot) => snapshot.storeId === storeId,
    );
    const mountedEntityIds = mountedStore?.archetypes.flatMap((archetype) =>
        archetype.entities.map((entity) => entity.entityId),
    );

    sceneManager.execute({ pass: "update", ctx, run: { dt: 16 } });
    worldManager.publish();

    const playerAfterMove = worldManager.view.debug.stores
        .find((snapshot) => snapshot.storeId === storeId)
        ?.archetypes.flatMap((archetype) => archetype.entities)
        .find((entity) => entity.entityId === "demo.player");

    sceneManager.commands.request.pop();
    sceneManager.flush();
    worldManager.flush();
    worldManager.publish();

    console.log("Scene + world demo metrics", {
        beforeFlushMetrics,
        sceneRev: sceneManager.view.rev,
        worldRev: worldManager.view.rev,
        mountCount,
        cleanupCount,
        mountedEntityIds,
        updateLog: ctx.log,
        playerAfterMove,
        finalSceneStackCount: sceneManager.view.stack.instanceIds.length,
        finalWorldEntityCount: worldManager.view.debug.entityCount,
        sceneMounted: mountCount === 1,
        entitiesSpawnedOnMount: mountedEntityIds?.length === entityIds.length,
        movementSystemRan: ctx.log.length === entityIds.length,
        cleanupDestroyedEntities: worldManager.view.debug.entityCount === 0,
    });
};
