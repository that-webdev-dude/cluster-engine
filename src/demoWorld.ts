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

    const rows = worldManager.query(storeId, ["position", "velocity"]);
    const [moving] = rows;
    const beforePosition = moving
        ? {
              x: moving.components.position.x.read(),
              y: moving.components.position.y.read(),
          }
        : undefined;

    if (moving) {
        const position = moving.components.position;
        const velocity = moving.components.velocity;
        position.x.write(Number(position.x.read()) + Number(velocity.x.read()));
        position.y.write(Number(position.y.read()) + Number(velocity.y.read()));
    }

    worldManager.publish();

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
        movementQueryCount: rows.length,
        beforePosition,
        afterPosition: entity?.components.position,
        queryApiUpdatedPosition: entity?.components.position.x === 21,
        entityInStore: Boolean(entity),
        entity,
    });
};
