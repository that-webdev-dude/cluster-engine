# Scene Manager

The scene manager owns the active scene stack and the scene-owned systems that
run for each frame pass. It is a manager-style engine service: scene mutations
are queued, applied with `flush()`, and exposed through a stable read-only
execution plan.

Use it from an orchestrator when you need scene stack behavior without exposing
stack internals or the private scheduler.

## What It Does

- Queues scene requests with `commands.request.set(scene)`, `push(scene)`, and
  `pop()`.
- Applies queued scene changes during `flush()`.
- Mounts scenes, provides `SceneCtx.addSystems(...)`, and runs scene cleanup on
  unmount.
- Keeps registered systems scoped to the scene instance that mounted them.
- Publishes pass windows through `view.stack`, `view.input`, and
  `view.update`.
- Executes scene-owned systems with `execute({ pass, ctx, run })`.

The scene manager does not own the main loop, world data, rendering, assets,
input, camera state, or game authoring sugar. A higher-level game orchestrator
coordinates those services.

## Runtime Model

A `Scene<C, R>` has:

- `id`: stable scene definition id.
- `instanceId`: optional runtime instance id. Defaults to `id`.
- `policy`: optional stack behavior.
- `onMount(ctx)`: optional setup callback that may register systems and return
  cleanup.

Systems use the shared runtime `System<C, R>` type from `engine/systems`.
Scene execution passes are:

```ts
"input" | "update"
```

Input runs top-to-bottom. Update runs bottom-to-top. Scene policies can capture
input or block update below the topmost matching scene.

## Usage

```ts
import { createSceneManager, type Scene } from "./cluster/engine/managers/scene";
import type { System } from "./cluster/engine/systems";

type FrameCtx = { log: string[] };
type FrameRun = number;

const system: System<FrameCtx, FrameRun> = {
    id: "demo.update",
    phase: "update",
    group: "main",
    groupOrder: 0,
    order: 0,
    execute(ctx, dt) {
        ctx.log.push(`tick:${dt}`);
    },
};

const scene: Scene<FrameCtx, FrameRun> = {
    id: "demo.scene",
    onMount(ctx) {
        ctx.addSystems(system);
    },
};

const scenes = createSceneManager<FrameCtx, FrameRun>({ debug: true });

await scenes.start();
scenes.commands.request.set(scene);

// Structural boundary.
scenes.flush();

// Frame execution.
scenes.execute({
    pass: "update",
    ctx: { log: [] },
    run: 16,
});
```

`execute(...)` never calls `flush()`. Queue scene requests whenever needed, but
apply them at the orchestrator's structural boundary.

## Lifecycle

- `start()` enables `flush()` and `execute(...)`.
- `stop()` preserves state but makes `flush()` and `execute(...)` no-ops.
- `dispose()` clears queued commands, unmounts scenes, unregisters systems, and
  publishes an empty plan.

In debug mode, calls after dispose throw through the shared lifecycle guard.
