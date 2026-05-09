# Loop Service

The loop service owns the engine's frame clock. It is a small runtime service:
platform frame callbacks drive fixed-step timing, update steps are accumulated,
and frame interpolation is reported to render-facing orchestration.

Use it from an orchestrator when engine services and managers need a coherent
frame order without owning `requestAnimationFrame` directly.

## What It Does

- Requests and cancels platform animation frames.
- Accumulates elapsed time and reports bounded fixed update counts.
- Clamps very large frame deltas to avoid runaway catch-up work.
- Computes `alpha` for interpolation-facing render orchestration.
- Calls `onFrameUpdate(frame)` once per platform frame with timing metadata.
- Calls `onFrameRender(frame)` once per platform frame with interpolation
  metadata.
- Resets accumulated timing state on stop.

The loop service does not own display, input, world data, scene state, or
rendering. The game orchestrator maps loop timing frames onto the frame
pipeline. The loop reports how many fixed updates are due; it does not decide
which engine phases run inside those updates.

## Usage

```ts
import {
    createLoop,
    type LoopFrameRender,
    type LoopFrameUpdate,
} from "./cluster/engine/services/loop";

function onFrameUpdate(frame: LoopFrameUpdate) {
    runBeginUpdate();
    runInput();
    for (let i = 0; i < frame.updateSteps; i++) {
        runFixedUpdate(frame.fixedStepMs);
    }
}
function onFrameRender(frame: LoopFrameRender) {
    runPreRender(frame.alpha);
    runRender(frame.alpha);
}
const loop = createLoop({
    onFrameUpdate,
    onFrameRender,
    platform,
    debug,
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
