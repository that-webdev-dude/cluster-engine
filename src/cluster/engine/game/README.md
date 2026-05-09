# Game Service

The game service is the high-level orchestrator for authored game scenes. It
creates the display service, input service, scene manager, world manager, and
loop service, then coordinates their frame order through the game frame
pipeline.

Use it when author code should define portable scenes, systems, and entities
without constructing runtime managers directly.

## What It Does

- Adapts authored scenes into runtime scene-manager scenes.
- Owns the core services and managers for the game.
- Builds the `GameCtx` passed to scene-owned systems.
- Queues scene requests through authored scene commands.
- Queues world commands through scoped game world commands.
- Binds world queries and commands to the current scene instance store.
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
        for (const row of ctx.world.query(["position", "velocity"])) {
            const position = row.components.position;
            const velocity = row.components.velocity;

            const nextX =
                Number(position.x.read()) + Number(velocity.x.read()) * dt;

            position.x.write(nextX);
        }
    },
});

export const level = scene({
    id: "level",
    setup(ctx) {
        ctx.addEntities(player);
        ctx.addSystems(movement);
    },
});
```

When an authored scene mounts, `ctx.addEntities(...)` queues spawns into the
scene instance store. The current scene instance id defaults to the authored
scene id. When the scene unmounts, the adapter runs authored cleanup and then
queues `clearStore(instanceId)`.

## Runtime Flow

The game frame pipeline owns the current frame order:

```text
beginUpdate:
  display.latch()
  input.latch(display.view)
  sceneManager.flush()
  worldManager.flush()
  worldManager.publish()

input:
  sceneManager.scopedExecute(pass: "input")

update, repeated updateSteps times:
  sceneManager.scopedExecute(pass: "update")

prepareRender:
  worldManager.flush()
  worldManager.publish()
  config.prepareRender(readOnlyCtx)

render:
  future renderer boundary
```

Scene requests made by systems are queued and applied at the next
`sceneManager.flush()`. World commands are queued and applied at the next
`worldManager.flush()`. The prepare-render world flush and publish make world
commands requested by scene systems visible to downstream read-only consumers
before the frame ends. `prepareRender` is a temporary read-only bridge until a
renderer service owns extraction and draw preparation.

## Usage

```ts
import { createGame } from "./cluster/engine/game";
import { level } from "./level";

const game = createGame({
    canvas,
    initialScene: level,
    prepareRender(ctx) {
        console.log(ctx.alpha, ctx.world.stores);
    },
    debug: true,
});

await game.start();

console.log(game.debug.sceneStack.instanceIds);
console.log(game.debug.world.stores);

await game.dispose();
```

Systems receive `GameCtx`:

```ts
ctx.display;
ctx.input;

ctx.scene.request.set(nextScene);
ctx.scene.request.push(menuScene);
ctx.scene.request.pop();

ctx.world.query(["position", "velocity"]);

ctx.world.commands.request.spawn(entity);
ctx.world.commands.request.destroy(entityId);
ctx.world.commands.request.clear();
```

The game context scopes world access to the current scene instance store. Use
the lower-level world manager directly only when an orchestrator needs explicit
store ids.

## Lifecycle

- `start()` starts display, input, world manager, scene manager, and loop.
- `stop()` stops loop, scene manager, world manager, input, and display while
  preserving manager state.
- `dispose()` disposes loop, scene manager, world manager, input, and display.

In debug mode, disposed services reject later calls through the shared lifecycle
guard.
