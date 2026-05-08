# Authoring Model

Current authoring model and the constraints that should guide its evolution.
The authoring API is intentionally provisional while world storage and renderer
ownership are still being designed.

## Stable Authoring Goals

- Author code should be ergonomic and readable.
- Authored definitions should be portable before a `Game` exists.
- Authoring convenience should adapt into efficient runtime structures.
- User-facing APIs should avoid exposing manager internals too early.
- Authoring APIs should not prevent data-oriented world storage, renderer
  extraction, batching, or streaming.

## Current Entry Point

The game package currently exports:

```ts
import { createGame, entity, scene, system } from "./cluster/engine/game";
```

This is current API shape, not necessarily the final authoring model.

## Current Entities

Entities are currently authored as plain records with an `id` and component
objects:

```ts
const player = entity("player", {
    position: { x: 0, y: 0 },
    velocity: { x: 1, y: 0 },
});
```

This shape is convenient, but it should not constrain the eventual world data
layout. Future entity authoring may need schemas, archetype declarations,
prefabs, resource references, binary-friendly component definitions, or
separate authored/runtime component models.

## Current Systems

Systems currently wrap the shared runtime system contract and default to the
`fixedUpdate` phase:

```ts
const movement = system({
    id: "movement",
    execute(ctx, dt) {
        for (const row of ctx.world.query(["position", "velocity"])) {
            const position = row.components.position;
            const velocity = row.components.velocity;

            position.x.write(
                Number(position.x.read()) + Number(velocity.x.read()) * dt,
            );
        }
    },
});
```

Future system APIs may need better query declarations, access modes, scheduling
metadata, parallelism constraints, render extraction hooks, or fixed/variable
step separation.

## Current Scenes

Scenes currently group authored entities and systems:

```ts
const level = scene({
    id: "level",
    setup(ctx) {
        ctx.addEntities(player);
        ctx.addSystems(movement);
    },
});
```

Scene ownership is useful, but the exact cleanup and store-scoping model may
evolve when streaming, persistence, asset lifetime, or renderer ownership are
designed.

## Current Game Context

Systems currently receive `GameCtx`, including display, input, scene commands,
world queries, and scoped world commands.

Current examples:

```ts
ctx.scene.request.set(nextScene);
ctx.world.query(["position", "velocity"]);
ctx.world.commands.request.spawn(entity);
```

This shape should be treated as current implementation. Future context design
may separate simulation, rendering, input, resources, commands, and queries more
explicitly.

## Evolution Rules

- Do not optimize authoring ergonomics by making runtime storage worse.
- Do not expose final-looking APIs for renderer or world concepts that are not
  designed yet.
- Prefer adapters between authored definitions and runtime data.
- Keep authored API changes small until the runtime ownership model is clearer.
- When changing authoring, describe the runtime data-layout consequence.
