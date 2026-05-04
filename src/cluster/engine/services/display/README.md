# Display Service

The display service owns the canvas surface metrics used by the engine. It is a
small runtime service: resize, DPR, fullscreen, and coordinate-conversion state
are sampled with `latch()` and exposed through a stable read-only `DisplayView`.

Use it from an orchestrator when systems or downstream services need coherent
frame dimensions without reading the canvas directly.

## What It Does

- Tracks drawing-buffer size with `view.w` and `view.h`.
- Tracks effective DPR, CSS size, canvas rect, fullscreen state, revision, and
  change flag.
- Supports fixed-size surfaces and auto-sized HTML canvas surfaces.
- Converts between CSS, client, and surface coordinates.
- Observes browser resize and fullscreen changes when platform objects are
  available.

The display service does not own rendering, input events, camera state, assets,
or the main loop. The game orchestrator starts it and calls `latch()` at the
frame boundary.

## Usage

```ts
import { createDisplay } from "./cluster/engine/services/display";

const display = createDisplay({
    canvas,
    options: {
        mode: "fixed",
        size: { w: 800, h: 600 },
    },
});

await display.start();
display.latch();

console.log(display.view.w, display.view.h);
```

In the game service, systems read the latched display view through
`ctx.display`.

```ts
system({
    id: "bounds",
    execute(ctx) {
        const maxX = ctx.display.w;
        const maxY = ctx.display.h;
    },
});
```

## Lifecycle

- `start()` attaches observers and marks the surface pending for the next latch.
- `latch()` samples DPR and pending surface/fullscreen changes while running.
- `stop()` detaches observers and preserves the last published view.
- `dispose()` detaches observers and invalidates later debug calls through the
  shared lifecycle guard.

Call `latch()` once near the beginning of a frame before building frame context
or running systems that read display state.
