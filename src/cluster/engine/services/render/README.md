# Render Service

The render service is a sealed engine service domain. Game orchestration builds
renderer-owned `RenderFrameInput`, calls `render.prepare(input)`, then calls
`render.execute()` during the render phase.

Render does not consume world, scene, entity, query-row, manager-view, or legacy
published-frame types. Extraction from current game/world state belongs outside
this package.

## What It Does

- Owns render lifecycle, frame preparation, backend submission, and render
  metrics.
- Accepts ordered 2D layers with renderer-domain rect, sprite, circle, ellipse,
  polygon, and line items.
- Resolves previous/current transform data with frame `alpha` during
  preparation.
- Keeps backend, GPU resources, pipeline compilation, batching, and submission
  private to the render package.
- Exposes debug state through `RenderView`, which `GameDebugView.render`
  forwards as read-only renderer view data.

The render service does not own authored systems, world storage, scene
ownership, display metrics, input, asset management, or game frame sequencing.

## Public API

```ts
import { createRender, type RenderFrameInput } from "./cluster/engine/services/render";

const render = createRender({ canvas, debug: true });
await render.start();

const input: RenderFrameInput = {
    target: { w: 800, h: 600, dpr: 1 },
    alpha: 0.5,
    layers: [
        {
            id: "main",
            order: 0,
            items: [
                {
                    kind: "rect",
                    sortKey: 0,
                    x: 100,
                    y: 100,
                    prevX: 90,
                    prevY: 100,
                    w: 32,
                    h: 32,
                    color: { r: 0.2, g: 0.6, b: 0.9 },
                },
            ],
        },
    ],
};

render.prepare(input);
render.execute();

console.log(render.view.stats);
```

The package barrel intentionally stays narrow: `createRender` plus public
render-domain types. Internal modules and subservices are not exported as engine
API.

## Lifecycle

- `start()` starts graphics, GPU resource, and pipeline-library ownership, then
  registers configured resources.
- `prepare(input)` validates and lowers renderer-domain input into a prepared
  frame while updating frame metrics.
- `execute()` syncs backend state, submits the prepared frame when possible, and
  records the submit result.
- `stop()` clears pending prepared work and stops private render subservices.
- `dispose()` clears resources and invalidates later debug-mode calls through
  the shared lifecycle guard.

Game starts render before managers and stops it after managers, so render is
available for the frame pipeline but does not own world or scene state.

## Frame Flow

```text
createGame
  -> GameFramePipeline.prepareRender(alpha)
  -> RenderExtraction.extractRenderFrameInput(...)
  -> render.prepare(input)
  -> GameFramePipeline.render(alpha)
  -> render.execute()
```

`RenderExtraction` is a transitional game-owned adapter. It currently reads
`position`, `prevPosition`, `size`, and optional `color` rows from active scene
stores and writes sealed `RenderFrameInput`.

## Debug View

`RenderView` reports:

- selected backend and graphics state;
- prepared frame sequence;
- target size and DPR;
- last submit result;
- per-frame stats such as pass, command, batch, draw-call, vertex, skipped
  resource, fallback resource, and texture counts.

These values are diagnostic renderer data, not public access to backend
internals.

## Backend Path

WebGL2 is the first active backend path. `gfxBackend` acquires and tracks the
context, `gpuResource` owns GPU-side resources and uploads, `pipelineLibrary`
compiles/caches shader programs, and `SubmitFrame` submits prepared batches.

WebGPU parity, richer resource lifetimes, asset integration, GPU-side
interpolation, text rendering, and long-term ECS extraction remain provisional
areas.
