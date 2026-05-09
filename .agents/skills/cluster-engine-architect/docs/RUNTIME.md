# Runtime Flow

Current runtime flow and the architectural constraints behind it. Treat exact
phase names and ordering as current implementation details unless the task is
about preserving behavior.

## Stable Runtime Ideas

- Lifecycle state should be explicit and shared across services and managers.
- Structural mutations should become visible at predictable boundaries.
- Systems should observe coherent frame state instead of half-applied platform
  or storage changes.
- Rendering, simulation, input sampling, and world publication should remain
  separable enough to evolve independently.
- Runtime loops should support deterministic simulation choices where possible.

## Current Lifecycle

`createGame(config)` currently creates display, input, loop, scene manager,
world manager, authored scene adapter, and frame pipeline.

Current startup order:

```text
display.start()
input.start()
worldManager.start()
sceneManager.start()
loop.start()
```

Current shutdown order:

```text
loop.stop()
sceneManager.stop()
worldManager.stop()
input.stop()
display.stop()
```

This order is current behavior. Future renderer or asset services may require
new lifecycle dependencies.

## Current Loop Timing

The loop service currently owns platform frame callbacks, fixed-step
accumulation, update-step capping, frame delta clamping, and interpolation
alpha calculation. It reports timing frames instead of directly invoking engine
phases:

```text
onFrameUpdate:
  frameDeltaMs
  rawFrameDeltaMs
  fixedStepMs
  updateSteps
  droppedUpdates

onFrameRender:
  alpha
  frameDeltaMs
  rawFrameDeltaMs
```

The game frame pipeline maps these timing frames onto current engine phases.
The loop service should remain a timing primitive rather than an owner of
display, input, simulation, scene, world, or rendering semantics.

Scene systems currently use:

```ts
"input" | "fixedUpdate" | "preRender"
```

These names are not final architecture. `preRender`, input sampling, render
handoff, and publication timing may change when the renderer service and world
data layout are designed.

## Current Frame Pipeline

Current frame pipeline:

```text
onFrameUpdate:
  beginUpdate:
    display.latch()
    input.latch(display.view)
    sceneManager.flush()
    worldManager.flush()
    worldManager.publish()

  input:
    sceneManager.scopedExecute(pass: "input")

  fixedUpdate, repeated updateSteps times:
    sceneManager.scopedExecute(pass: "fixedUpdate")

onFrameRender:
  preRender:
    sceneManager.scopedExecute(pass: "preRender")

  render:
    worldManager.flush()
    worldManager.publish()
```

This is a snapshot of current behavior, not a command to preserve these exact
boundaries forever. Architectural changes should explain which visibility,
determinism, or performance property they preserve or improve.

## Command And Read Boundaries

Current scene and world changes use command queues. That pattern is important
because it protects owned state and makes structural visibility explicit.

The exact command names and `GameCtx` paths may evolve. Preserve the principle:
systems request structural changes; managers decide when and how those changes
are applied.

World queries may need to change significantly as storage evolves. Designs
should leave room for efficient iteration, batched queries, read/write access
rules, and renderer-friendly extraction without requiring broad authoring API
breakage.

## Scale-Sensitive Questions

- How are active entities separated from stored or sleeping entities?
- Which queries need cache-friendly dense iteration?
- How do debug snapshots avoid copying large worlds every frame?
- How does renderer extraction avoid fighting simulation storage layout?
- Where do command buffers, deferred destruction, and compaction happen?
- What guarantees do systems need about stale rows, handles, and component
  access?
