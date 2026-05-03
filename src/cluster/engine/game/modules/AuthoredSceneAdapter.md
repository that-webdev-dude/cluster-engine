# Authored Scene Adapter

## Purpose

`AuthoredSceneAdapter` converts portable game-authored scene definitions into
runtime scenes that the scene manager can mount and execute.

This module should be private to the game package. It exists to concentrate the
rules that bridge authoring language to runtime manager language:

- authored scenes can be created before a `Game` exists.
- runtime scenes need a concrete `instanceId`.
- authored `addSystem(...)` registers scene-owned systems.
- authored `addEntity(...)` queues world spawns into the scene instance store.
- scene cleanup returned by authored setup is preserved.

The scene manager should not learn about the world manager. The world manager
should not learn about scenes. This adapter is the game-level bridge.

## Recommended Implementation

```ts
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
            policy: authoredScene.policy,
            onMount(runtimeCtx) {
                return authoredScene.setup({
                    addSystem(system) {
                        runtimeCtx.addSystems(system);
                    },
                    addEntity(entity) {
                        deps.spawnEntity(instanceId, entity);
                    },
                });
            },
        };
    }

    return Object.freeze({
        toRuntimeScene,
    });
}
```

## Why This Shape

The external interface is intentionally small: one factory and one method. The
adapter has one runtime dependency, `spawnEntity(...)`, instead of depending on
the whole world manager. That gives the module enough leverage to do its job
without exposing unrelated world commands.

This also keeps the seam honest. The adapter is not a new game service, not a
manager, and not a reusable engine primitive. It is a private module inside the
game orchestrator implementation.

## How `Game.service` Should Use It

```ts
const authoredSceneAdapter = createAuthoredSceneAdapter({
    spawnEntity(storeId, entity) {
        worldManager.commands.request.spawn(storeId, entity);
    },
});

sceneManager.commands.request.set(
    authoredSceneAdapter.toRuntimeScene(config.initialScene),
);
```

Then game scene commands should use the same adapter:

```ts
const sceneCommands: GameSceneCommands = {
    request: {
        set(scene) {
            sceneManager.commands.request.set(
                authoredSceneAdapter.toRuntimeScene(scene),
            );
        },
        push(scene) {
            sceneManager.commands.request.push(
                authoredSceneAdapter.toRuntimeScene(scene),
            );
        },
        pop() {
            sceneManager.commands.request.pop();
        },
    },
} as const;
```

## Invariants

- `instanceId` defaults to `authoredScene.id`.
- `policy` is copied through unchanged.
- `setup(...)` is not run during adaptation. It runs only when the runtime scene
  mounts.
- `addSystem(...)` delegates to the runtime scene context.
- `addEntity(...)` queues a spawn for the resolved scene instance store.
- the authored cleanup callback is returned unchanged to the scene manager.

## Tests I Would Add

1. `toRuntimeScene(...)` preserves `id`, `instanceId`, and `policy`.
2. `toRuntimeScene(...)` defaults `instanceId` to `id`.
3. adaptation does not call authored `setup(...)`.
4. runtime `onMount(...)` calls authored `setup(...)`.
5. authored `addSystem(...)` delegates to `runtimeCtx.addSystems(...)`.
6. authored `addEntity(...)` calls `spawnEntity(instanceId, entity)`.
7. cleanup returned from authored `setup(...)` is returned by runtime
   `onMount(...)`.

## Deferred Work

Do not add scene-scoped world helpers here yet. If the game context later gains
ergonomic helpers such as `ctx.world.spawn(entity)`, that belongs in a game
context or command facade module above this adapter. This adapter should only
translate authored scene setup into runtime scene mounting.
