# World Manager

The world manager owns runtime entity data for the engine. It is a
manager-style service: structural changes are queued, applied with `flush()`,
and published as stable snapshots with `publish()`.

Use it from an orchestrator or frame context when systems need to spawn,
destroy, query, or mutate store-scoped entity data without knowing storage
internals.

## What It Does

- Queues world commands through `commands.request`.
- Applies queued structural changes during `flush()`.
- Stores entities by `storeId` and archetype.
- Enforces immutable component composition: systems may edit existing fields,
  but cannot add or remove components.
- Provides live query rows for systems during frame execution.
- Publishes copied debug snapshots through `view.debug`.
- Keeps mutation and publication separate.

The world manager does not own scenes, scheduling, rendering, input, camera
state, assets, or authoring helpers.

## Data Model

An entity belongs to exactly one store and one archetype:

- `storeId`: owner scope, often a scene instance id.
- `entityId`: runtime identity within the store.
- `archetypeId`: sorted component-name set, such as `"position|velocity"`.

Component fields are storage primitives:

```ts
number | string
```

Nested objects, arrays, functions, and arbitrary values are not component field
values.

## Commands

Commands are queued. They do not change live storage until `flush()`.

```ts
world.commands.request.spawn("level#1", {
    id: "player",
    position: { x: 0, y: 0 },
    velocity: { x: 1, y: 0 },
});

world.commands.request.destroy("level#1", "player");
world.commands.request.clearStore("level#1");
world.commands.request.clear();
```

Use `clearStore(storeId)` when a higher-level owner, such as a scene instance,
is being torn down. Use `clear()` for full world reset or disposal-style flows.

## Query

Queries read and write live component fields inside one store.

```ts
const rows = world.query("level#1", ["position", "velocity"]);

for (const row of rows) {
    const position = row.components.position;
    const velocity = row.components.velocity;

    const nextX = Number(position.x.read()) + Number(velocity.x.read()) * dt;
    const nextY = Number(position.y.read()) + Number(velocity.y.read()) * dt;

    position.x.write(nextX);
    position.y.write(nextY);
}
```

Query rows are live mutable views, not snapshots. Field writes accept only
finite numbers or strings. If a row becomes stale because its entity was
destroyed or moved by storage compaction, later reads or writes throw.

## Publication

`flush()` updates live storage. `publish()` copies live storage into a stable
debug snapshot:

```ts
world.flush();
world.publish();

console.log(world.view.debug.stores);
```

Published snapshots are safe to hold for the frame. Systems should use
`query(...)` for live simulation data and published views for downstream
read-only consumers.

## Lifecycle

- `start()` enables `flush()`, `query(...)`, and `publish()`.
- `stop()` preserves live storage but makes `flush()` and `publish()` no-ops.
- `dispose()` clears queued commands, live storage, indexes, and published
  snapshots.

In debug mode, calls after dispose throw through the shared lifecycle guard.
