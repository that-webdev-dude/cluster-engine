import { createWorldManager } from "./cluster/engine/managers/world/World.manager";

const worldManager = createWorldManager({
    debug: true,
});

export default async () => {
    const storeId = "demo.store";
    const entityId = "demo.player";

    await worldManager.start();

    worldManager.commands.request.spawn(storeId, {
        id: entityId,
        position: { x: 20, y: 40 },
        velocity: { x: 1, y: 0 },
    });

    worldManager.flush();
    worldManager.publish();

    const rows = worldManager.query(storeId, ["position"]);
    const store = worldManager.view.debug.stores.find(
        (snapshot) => snapshot.storeId === storeId,
    );
    const entity = store?.archetypes
        .flatMap((archetype) => archetype.entities)
        .find((snapshot) => snapshot.entityId === entityId);

    console.log("World manager demo metrics", {
        rev: worldManager.view.rev,
        changed: worldManager.view.changed,
        storeCount: worldManager.view.debug.storeCount,
        totalEntityCount: worldManager.view.debug.entityCount,
        demoStoreEntityCount: store?.entityCount ?? 0,
        positionQueryCount: rows.length,
        entityInStore: Boolean(entity),
        entity,
    });
};
