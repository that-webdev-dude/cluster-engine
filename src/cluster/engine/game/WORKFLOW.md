# Game Service Workflow

This note captures the intended workflow for the future `Game.service`.
The core idea is that authored scenes should be portable definitions, while the
game service adapts them into runtime scenes once it has real manager instances.

## Main Principle

Authors should be able to create scenes before a `Game` instance exists.

```ts
export const levelOne = scene({
    id: "level.one",
    setup(ctx) {
        ctx.addEntity({
            id: "player",
            position: { x: 0, y: 0 },
        });

        ctx.addSystem(movementSystem);
    },
});
```

Authors should not need to call `game.scene(...)` for normal scene creation.
That would make scene definitions runtime-bound and harder to define in separate
modules.

## Authoring Scene vs Runtime Scene

An authoring scene is a portable definition.

It can include:

- `id`
- optional `instanceId`
- `setup(ctx)`

The setup context can expose author-friendly commands:

- `addSystem(system)`
- `addEntity(entity)`

A runtime scene is the lower-level `Scene<C, R>` consumed by the scene manager.
It has:

- `id`
- `instanceId`
- `onMount(runtimeSceneCtx)`

The game service owns the conversion from authoring scene to runtime scene.

## Dependency Direction

The scene manager should not know about the world manager.

The world manager should not know about scenes.

The game service is the bridge because it creates and owns both managers.

```ts
const sceneManager = createSceneManager<GameCtx, GameRun>({ debug });
const worldManager = createWorldManager({ debug });
```

Once the game service has both managers, it can adapt authored scenes.

## Adaptation Step

When the game service receives an authored scene, it converts it into a runtime
scene.

Conceptually:

```ts
function toRuntimeScene(authoredScene: AuthoredScene): Scene<GameCtx, GameRun> {
    const instanceId = authoredScene.instanceId ?? authoredScene.id;

    return {
        id: authoredScene.id,
        instanceId,
        onMount(runtimeCtx) {
            return authoredScene.setup({
                addSystem(system) {
                    runtimeCtx.add(system);
                },
                addEntity(entity) {
                    worldManager.commands.request.spawn(instanceId, entity);
                },
            });
        },
    };
}
```

The important detail is that `instanceId` becomes the default world `storeId`
for entities created during scene setup.

## Mount And Flush Order

Scene setup should queue world changes, not apply them immediately.

The orchestrator frame boundary should run in this order:

```ts
sceneManager.flush();
worldManager.flush();
worldManager.publish();
```

During `sceneManager.flush()`:

1. Queued scene commands are applied.
2. New scenes mount.
3. Authored `setup(ctx)` runs.
4. `ctx.addSystem(...)` registers scene-owned systems.
5. `ctx.addEntity(...)` queues world spawns for the scene instance store.

During `worldManager.flush()`:

1. Queued entity spawns become live in world storage.
2. Entity data becomes queryable by systems.

During `worldManager.publish()`:

1. Stable world snapshots become available for downstream consumers.

## System Execution

The game service should execute scene systems through the scene manager:

```ts
sceneManager.execute({
    pass: "input",
    ctx: frameGameCtx,
    run,
});

sceneManager.execute({
    pass: "fixedUpdate",
    ctx: frameGameCtx,
    run,
});

sceneManager.execute({
    pass: "preRender",
    ctx: frameGameCtx,
    run,
});
```

The scheduler should remain private to the scene manager.

## Game Context Adapters

The game service should expose game-level adapters in `GameCtx`, not force
systems to call low-level manager APIs directly.

The adapters are created after the scene and world managers exist.

```ts
const sceneManager = createSceneManager<GameCtx, GameRun>({ debug });
const worldManager = createWorldManager({ debug });
```

Then the game service prepares facades that close over those managers.

Systems consume the facades through `GameCtx`:

```ts
type GameCtx = {
    scene: GameSceneCommands;
    world: GameWorldCommands;
};
```

The scene facade should accept authored scenes and convert them before queueing
runtime scene manager commands.

Conceptually:

```ts
const sceneCommands: GameSceneCommands = {
    request: {
        set(scene) {
            sceneManager.commands.request.set(toRuntimeScene(scene));
        },
        push(scene) {
            sceneManager.commands.request.push(toRuntimeScene(scene));
        },
        pop() {
            sceneManager.commands.request.pop();
        },
    },
};
```

This lets systems request authored scenes:

```ts
ctx.scene.request.set(gameOverScene);
```

while the runtime scene manager still receives only runtime `Scene<GameCtx,
GameRun>` objects.

The world facade can provide game-facing world commands while preserving the
world manager's queued mutation model.

Conceptually:

```ts
const worldCommands: GameWorldCommands = {
    request: {
        spawn(storeId, entity) {
            worldManager.commands.request.spawn(storeId, entity);
        },
        destroy(storeId, entityId) {
            worldManager.commands.request.destroy(storeId, entityId);
        },
    },
};
```

Later, when the game service has a notion of current scene scope, ergonomic
helpers may default the `storeId` to the current scene instance. Keep that as
authoring sugar above the world manager, not as storage behavior inside the
world manager.

## Scene Requests From Systems

Systems may request scene changes during gameplay through the `GameCtx` scene
facade.

Example:

```ts
ctx.scene.request.set(gameOverScene);
```

This should queue a scene command only. It must not apply the scene change while
systems are currently executing.

The expected flow is:

1. A system runs during a pass such as `fixedUpdate`.
2. The system calls `ctx.scene.request.set(nextScene)`.
3. The game scene facade converts `nextScene` with `toRuntimeScene(...)`.
4. The facade queues `sceneManager.commands.request.set(runtimeScene)`.
5. The current pass continues against the current published scene plan.
6. At the next structural boundary, the game service calls
   `sceneManager.flush()`.
7. The old scene unmounts and cleanup runs.
8. The new scene mounts and its setup runs.
9. Setup can queue world entity spawns.
10. The game service calls `worldManager.flush()` to apply those spawns.

This preserves frame stability and prevents scene stack or scheduler mutation
during system execution.

## Cleanup

When a scene unmounts, the cleanup returned from `setup(ctx)` should run.

For v1, scene-authored entity cleanup may be explicit:

```ts
return () => {
    worldManager.commands.request.destroy(instanceId, "player");
};
```

A later authoring layer can track entities added through `ctx.addEntity(...)`
and clear them automatically, likely by scene instance store.

Potential future shape:

```ts
worldManager.commands.request.clearStore(instanceId);
```

Only add this once the world manager has a public store-clear command and the
ownership rule is settled.

## Recommended Public Workflow

Author code:

```ts
const levelOne = scene({
    id: "level.one",
    setup(ctx) {
        ctx.addEntity(playerEntity);
        ctx.addSystem(movementSystem);
    },
});
```

Game startup:

```ts
const game = createGame({
    canvas,
    initialScene: levelOne,
});
```

Inside `Game.service`:

```ts
sceneManager.commands.request.set(toRuntimeScene(initialScene));
```

## Guardrails

- Do not require authors to create a `Game` before defining scenes.
- Do not make the scene manager depend on the world manager.
- Do not let `addEntity(...)` mutate live storage immediately.
- Do not expose raw scene manager commands in `GameCtx` if systems should work
  with authored scenes.
- Do not expose the private scheduler through the game service.
- Do not apply scene requests immediately from systems; queue them for the next
  `sceneManager.flush()`.
- Keep authored scene definitions portable and serializable where practical.
- Keep runtime manager APIs small; put ergonomic authoring sugar above them.
