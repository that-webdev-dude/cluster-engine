# Loop Service

The loop service owns the engine's frame clock. It is a small runtime service:
platform frame callbacks drive the engine frame phases, fixed-step updates are
accumulated, and frame interpolation is passed to render-facing callbacks.

Use it from an orchestrator when engine services and managers need a coherent
frame order without owning `requestAnimationFrame` directly.

## What It Does

- Requests and cancels platform animation frames.
- Runs `beginUpdate` once at the start of each frame.
- Runs `input` once per frame before fixed updates.
- Accumulates elapsed time and runs bounded fixed updates.
- Clamps very large frame deltas to avoid runaway catch-up work.
- Computes `alpha` for interpolation-facing `preRender` and `render` phases.
- Resets accumulated timing state on stop.

The loop service does not own display, input, world data, scene state, or
rendering. The game orchestrator wires loop callbacks to the frame pipeline.
The render domain is not implemented yet; the current `render` callback is a
frame phase hook reserved for render-facing work.

## Usage

```ts
import { createLoop } from "./cluster/engine/services/loop";

const loop = createLoop({
    onBeginUpdate() {
        display.latch();
        input.latch(display.view);
    },
    onInput() {
        framePipeline.input();
    },
    onFixedUpdate(dt) {
        framePipeline.fixedUpdate(dt);
    },
    onPreRender(alpha) {
        framePipeline.preRender(alpha);
    },
    onRender(alpha) {
        framePipeline.render(alpha);
    },
});

await loop.start();
```

## Lifecycle

- `start()` resets timing state and requests the first frame.
- `stop()` cancels any pending frame and clears accumulated timing state.
- `dispose()` cancels any pending frame and invalidates later debug calls
  through the shared lifecycle guard.

Start the loop after the services and managers it drives are already running.
Stop it before stopping those services so no later frame callback can observe a
partially stopped engine.
