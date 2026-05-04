# Game Service

The game service is the high-level orchestrator for authored game scenes. It
creates the scene manager, world manager, and loop service, then coordinates
their frame order through the game frame pipeline.

Use it when author code should define portable scenes, systems, and entities
without constructing runtime managers directly.

## What It Does

- Adapts authored scenes into runtime scene-manager scenes.
- Owns the scene manager and world manager instances for the game.
- Builds the `GameCtx` passed to scene-owned systems.
- Queues scene requests through authored scene commands.
- Queues world commands through game world commands.
- Runs the frame pipeline from the loop callbacks.
- Exposes a small debug view for the active scene stack and published world
  snapshot.

The game service does not own rendering yet, and it does not make the scene
manager depend on the world manager. The authored scene adapter is the bridge
between scene setup and world entity ownership.

## Authoring Model

Authored scenes are portable definitions. They can be created before a `Game`
exists.

```ts
import { entity, scene, system } from "./cluster/engine/game";

const player = entity("player", {
    position: { x: 0, y: 0 },
    velocity: { x: 1, y: 0 },
});

const movement = system({
    id: "movement",
    execute(ctx, dt) {
        ctx.world.request.spawn("level#1", {
            id: `spawned.${dt}`,
            position: { x: dt, y: 0 },
        });
    },
});

export const level = scene({
    id: "level",
    instanceId: "level#1",
    setup(ctx) {
        ctx.addEntities(player);
        ctx.addSystems(movement);
    },
});
```

When an authored scene mounts, `ctx.addEntities(...)` queues spawns into the
scene instance store. When the scene unmounts, the adapter runs authored cleanup
and then queues `clearStore(instanceId)`.

## Runtime Flow

The game frame pipeline owns the current frame order:

```ts
beginUpdate:
sceneManager.flush();
worldManager.flush();
worldManager.publish();
createGameCtx();

fixedUpdate:
sceneManager.execute({ pass: "input", ... });
sceneManager.execute({ pass: "fixedUpdate", ... });

preRender:
sceneManager.execute({ pass: "preRender", ... });

render:
worldManager.flush();
worldManager.publish();
```

Scene requests made by systems are queued and applied at the next
`sceneManager.flush()`. World commands are queued and applied at the next
`worldManager.flush()`.

## Usage

```ts
import { createGame } from "./cluster/engine/game";
import { level } from "./level";

const game = createGame({
    canvas,
    initialScene: level,
    debug: true,
});

await game.start();

console.log(game.debug.sceneStack.instanceIds);
console.log(game.debug.world.stores);

await game.dispose();
```

Systems receive `GameCtx`:

```ts
ctx.scene.request.set(nextScene);
ctx.scene.request.push(menuScene);
ctx.scene.request.pop();

ctx.world.request.spawn(storeId, entity);
ctx.world.request.destroy(storeId, entityId);
ctx.world.request.clear();
```

Use scene instance ids as world store ids when entities should be cleaned up
with their scene.

## Lifecycle

- `start()` starts the world manager, scene manager, and loop.
- `stop()` stops the loop, scene manager, and world manager while preserving
  manager state.
- `dispose()` disposes the loop and both managers.

In debug mode, disposed services reject later calls through the shared lifecycle
guard.
