# Scene Manager

The scene manager owns the active scene stack for the engine. It is a manager-style service: scene mutations are queued, applied at a frame boundary with `flush()`, then published as a stable execution plan for the current frame.

Use it when an orchestrator needs to decide which scene-owned systems participate in `input`, `fixedUpdate`, and `preRender` without exposing stack internals or the private scheduler.

## Responsibilities

- Queue scene changes through `commands.request.set(scene)`, `push(scene)`, and `pop()`.
- Apply queued changes during `flush()`.
- Mount scenes when they become active and unmount them when removed.
- Provide `SceneCtx.add(...)` during `onMount` so scenes can register systems.
- Keep scene-owned systems scoped to the scene instance that registered them.
- Publish a read-only `view` containing the stack and pass execution windows.
- Execute scene-owned systems for one pass through `execute({ pass, ctx, run })`.
- Dispose mounted scenes, cleanup callbacks, queued commands, and registered systems.

It does not own the main loop, game context creation, rendering, world state, assets, input latching, or camera updates. Those belong to the higher-level `Game` orchestrator and sibling services.

## Scene Model

A `Scene<C, R>` is a runtime unit with:

- `id`: stable authoring id.
- `instanceId`: optional runtime id. When omitted, the scene uses `id`, which gives singleton-by-definition behavior.
- `policy`: optional stack policy.
- `onMount(ctx)`: optional callback for registering systems and returning cleanup.

Scene systems use fixed scene execution passes:

```ts
"input" | "fixedUpdate" | "preRender"
```

The scene manager is generic only over `C` and `R`, the frame context and run payload passed into system execution. It is intentionally not generic over phase because the scene stack planner knows these three passes explicitly.

## Execution Plan

`flush()` drains queued scene commands, updates the active stack, and publishes a `SceneExecutionPlan`:

- `stack`: active scene instance ids in stack order, bottom to top.
- `input`: scenes eligible for input execution.
- `fixedUpdate`: scenes eligible for fixed update execution.
- `preRender`: scenes eligible for pre-render execution.

Each pass window includes `instanceIds` plus an execution `order`.

Input uses `topToBottom`. The planner starts at the topmost scene with `capturesInput: true`; scenes below it are excluded. If no scene captures input, all active scenes are included.

Fixed update and pre-render use `bottomToTop`. The planner starts at the topmost scene with `blocksUpdateBelow: true`; scenes below it are excluded. If no scene blocks update below, all active scenes are included.

## Implementation

The service is split into small private modules:

- `CommandQueue.module.ts`: stores pending `set`, `push`, and `pop` requests.
- `SceneStack.module.ts`: owns active mounted scenes and prevents duplicate active `instanceId`s.
- `SceneLifecycle.module.ts`: mounts/unmounts scenes, runs cleanup callbacks, and registers/unregisters scene systems.
- `ExecutionPlanner.module.ts`: converts the active stack and scene policies into pass windows.
- `Scheduler.module.ts`: privately stores and executes systems by owner scene, pass, group, order, and registration sequence.
- `SceneManager.view.ts`: exposes the published snapshot through read-only getters.

The scheduler is deliberately private. Consumers should not pass scope ids or access scheduler internals; they should call `execute(...)` and let the scene manager honor the published plan.

## Orchestrator Usage

The orchestrator should create the frame context once per frame, call `flush()` at the structural mutation boundary, then execute scene passes in loop order.

```ts
const sceneManager = createSceneManager<GameCtx, number>({ debug });

sceneManager.commands.request.set(initialScene);

function runBeginUpdate() {
    display.latch();
    input.latch(display.view);
    assets.latch();

    sceneManager.flush();
    worldManager.flush();

    frameGameCtx = createGameCtx();
}

function runFixedUpdate(dt: number) {
    if (!frameGameCtx) return;

    sceneManager.execute({
        pass: "input",
        ctx: frameGameCtx,
        run: dt,
    });

    sceneManager.execute({
        pass: "fixedUpdate",
        ctx: frameGameCtx,
        run: dt,
    });

    camera.tick(dt);
}

function runPreRender(alpha: number) {
    if (!frameGameCtx) return;

    sceneManager.execute({
        pass: "preRender",
        ctx: frameGameCtx,
        run: alpha,
    });

    camera.latch(alpha);
}
```

Important frame rule: `execute(...)` does not call `flush()`. Queue scene requests whenever needed, but apply them at the orchestrator's chosen frame boundary with `flush()` before executing passes.

## Lifecycle

`start()` enables `flush()` and `execute(...)`.

`stop()` leaves state intact but `flush()` and `execute(...)` become no-ops while stopped.

`dispose()` clears pending commands, unmounts active scenes, unregisters systems, publishes an empty plan, and rejects later calls through the lifecycle guard in debug mode.

