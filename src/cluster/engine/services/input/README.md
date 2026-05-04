# Input Service

The input service owns keyboard and pointer state for the engine. It is a small
runtime service: browser events are collected live, converted into surface-space
input with `latch(frame)`, and exposed through a stable read-only `InputView`.

Use it from an orchestrator when systems need coherent frame input without
subscribing to DOM events directly.

## What It Does

- Tracks keyboard `down`, `pressed`, and `released` state by key code.
- Tracks primary pointer position, delta, buttons, wheel deltas, and active
  pointers.
- Converts pointer client coordinates into display surface coordinates.
- Supports custom keyboard, pointer, and wheel targets.
- Clears transient pressed, released, and wheel state across latch boundaries.
- Detaches listeners and clears published state on stop and dispose.

The input service does not own display metrics, rendering, camera state, assets,
world data, or the main loop. The game orchestrator latches display first, then
latches input with the current display view.

## Usage

```ts
import { createInput } from "./cluster/engine/services/input";

const input = createInput({
    canvas,
});

await input.start();
input.latch(display.view);

console.log(input.view.keyboard.pressed("Space"));
console.log(input.view.pointer.x, input.view.pointer.y);
```

In the game service, systems read the latched input view through `ctx.input`.

```ts
system({
    id: "jump",
    execute(ctx) {
        if (ctx.input.keyboard.pressed("Space")) {
            // Queue commands or mutate queried world fields.
        }
    },
});
```

## Lifecycle

- `start()` attaches keyboard, pointer, wheel, blur, and visibility listeners.
- `latch(frame)` publishes frame-stable input while running.
- `stop()` detaches listeners and clears the published view.
- `dispose()` detaches listeners and invalidates later debug calls through the
  shared lifecycle guard.

Call `latch(display.view)` once near the beginning of a frame after display has
latched and before building frame context or running systems that read input.
