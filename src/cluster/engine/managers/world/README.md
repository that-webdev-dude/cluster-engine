# World Manager

The world manager owns runtime entity data for the engine. It is a manager-style service: entity mutations are queued, applied at a frame boundary with `flush()`, then published as stable snapshots for downstream engine consumers.

Use it when an orchestrator or scene-scoped system needs to spawn entities, destroy entities, query live component data, or publish frame-stable world output without exposing storage internals.

## Responsibilities

- Queue world changes through scene-scoped commands.
- Apply queued structural changes during `flush()`.
- Store entities by scene instance and archetype.
- Keep every entity scoped to the scene instance that created it.
- Assign each entity to one archetype when it is spawned.
- Provide query access for systems during frame execution.
- Publish stable snapshots through `publish()` for downstream engine consumers.
- Dispose queued commands, live storage, indexes, and published snapshots.

It does not own scene scheduling, scene stack policy, system registration, the main loop, presentation, input, assets, camera state, or authoring sugar. Those belong to the scene manager, game orchestrator, presentation services, sibling services, or higher-level authoring helpers.

The game orchestrator should not know about presentation-specific world views. World publication can feed lower-level engine presentation services, but game code should not call presentation APIs or depend on presentation-shaped snapshots.

## Core Invariants

Entity component composition is immutable.

An entity is assigned to an archetype when spawned, based on its initial component set. During the entity lifecycle, systems may mutate component field values but may not add or remove components. Changing component shape requires destroying the entity and spawning a replacement.

Every entity has exactly one scene scope.

Entities created during scene setup or by a system running for a scene are owned by that scene instance. When the scene unmounts, the world can destroy all entities owned by that scene without inspecting authoring-level state.

Structural changes are deferred.

Calls such as `spawn(...)`, `destroy(...)`, and `clear()` queue commands. They do not mutate live storage immediately. The orchestrator decides when queued changes become visible by calling `flush()`.

Publication is separate from mutation.

`flush()` updates live world storage. `publish()` creates stable snapshots from that storage. Downstream frame consumers should read published snapshots, not live mutable component arrays.

## Data Model

An entity is a stable runtime record with:

- `entityId`: runtime identity.
- `sceneInstanceId`: owner scene scope.
- `archetypeId`: component-set identity.
- component field values.

A component is a named record whose fields are storage primitives. For the first world manager version, component fields should be limited to:

```ts
number | string
```

No nested objects, arrays, functions, or arbitrary values are part of the component storage contract.

An archetype is the sorted set of component names for an entity. Examples:

```ts
"position"
"position|velocity"
"position|sprite"
```

Entities with the same component set live in the same archetype storage. Archetype storage should be laid out as structure-of-arrays data: numeric component fields can later use typed arrays, while string fields use normal arrays. The public contract should not depend on the internal array type.

## Authoring Flow

The author-facing API should be ergonomic and live above the runtime manager.

Authors should be able to define:

- entity templates with initial components.
- systems with an `execute(ctx, run)` function and execution phase.
- scenes with setup logic, internal scene state, initial spawns, and scene-owned systems.

An authoring scene might conceptually do this:

```ts
const levelOne = scene({
    id: "level.one",
    setup(ctx) {
        ctx.spawn(playerTemplate, {
            position: { x: 20, y: 40 },
        });

        ctx.add(movementSystem);
    },
});
```

That shape is authoring sugar. Runtime services should receive smaller commands and registrations. The world manager should not need to know how the authoring helper was written.

## Runtime Flow

When a scene mounts, its setup function receives a scene-scoped context.

That context can:

- queue initial world spawns for the scene.
- register systems with the scene manager.
- create scene-local state captured by those systems.

Initial spawns still become live only when the orchestrator calls `world.flush()`.

Systems run through the scene manager, but consume the world through frame context. The scene manager decides which scene-owned systems execute for `input`, `fixedUpdate`, and `preRender`; the world manager provides scoped commands and query access to the data those systems operate on.

## Commands

The first runtime command set should stay small:

```ts
spawn(entity)
destroy(entityId)
clear()
```

`spawn(...)` computes the archetype from the initial component set and inserts the entity into that archetype during `flush()`.

`destroy(...)` removes a specific entity during `flush()`.

`clear()` is mainly for disposal, tests, and full world reset.

The world manager should not expose:

```ts
addComponent(...)
removeComponent(...)
```

Those operations violate the immutable component-composition rule.

## Flush

`flush()` drains the command queue and applies structural changes to live storage.

For spawns, it should:

- resolve the scene scope.
- validate component names and field values.
- compute the archetype key.
- create runtime entity metadata.
- insert component fields into the matching archetype storage.
- update entity and scene indexes.

For destroys, it should:

- find the entity metadata.
- remove the entity from its archetype storage.
- update entity and scene indexes.
- ignore or report duplicate destroys according to debug mode.

For clear, it should:

- remove all live entities from storage.
- reset entity and scene indexes.
- leave schemas and reusable storage metadata intact when that helps later allocations.

`flush()` should not publish snapshots. Publication is a separate frame step.

## Publish

`publish()` creates stable read snapshots from live world storage.

A published snapshot should be safe for downstream engine consumers to hold for the rest of the frame. It should not expose mutable live component arrays.

Publication should do as little transformation as possible. Expensive layout decisions should already be represented in world storage or in cached runtime metadata by the time `publish()` runs.

The first published views are likely:

- debug snapshot.
- optional inspection snapshot.
- presentation snapshot.

Presentation-facing publication may filter entities by presentable components and convert component data into a frame input shape owned by a lower-level presentation service. The game orchestrator should not depend on that shape directly.

## Orchestrator Usage

The game orchestrator owns the frame pipeline. A typical shape is:

```ts
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

    sceneManager.execute({ pass: "input", ctx: frameGameCtx, run: { dt } });
    sceneManager.execute({ pass: "fixedUpdate", ctx: frameGameCtx, run: { dt } });

    worldManager.flush();
}

function runPreRender(alpha: number) {
    if (!frameGameCtx) return;

    sceneManager.execute({
        pass: "preRender",
        ctx: frameGameCtx,
        run: { alpha },
    });

    camera.latch(alpha);
    worldManager.publish();
}
```

The second `worldManager.flush()` after fixed update is optional policy, but useful when systems spawn or destroy entities during simulation and those changes should be visible before pre-render.

`flush()` is an orchestrator-facing boundary. Scene setup and systems may queue world commands, but they should not decide when structural changes are applied.

`publish()` may also be orchestrator-facing, but it should remain engine-facing rather than game-presentation-facing. The game pipeline can ask the world to publish without knowing how presentation services consume the result.

## Implementation

The service should be split into small private modules only when the behavior justifies it. Likely modules are:

- `CommandQueue.module.ts`: stores pending spawn, destroy, and clear commands.
- `EntityRegistry.module.ts`: owns entity metadata, id lookup, and scene ownership indexes.
- `ArchetypeStorage.module.ts`: owns archetype keys, chunk allocation, and component field columns.
- `Query.module.ts`: resolves component-set queries into hot-path iterators or views.
- `Publisher.module.ts`: converts live storage into stable published snapshots.
- `WorldManager.view.ts`: exposes published snapshots and revision state through read-only getters.

The internal storage should be private. Consumers should go through commands, scoped world context, query helpers, or published views.

## Lifecycle

`start()` enables `flush()`, query access, and `publish()`.

`stop()` leaves live state intact, but `flush()` and `publish()` become no-ops while stopped.

`dispose()` clears pending commands, live storage, indexes, and published snapshots, then rejects later calls through the lifecycle guard in debug mode.

## Deferred Work

The first implementation should focus on the runtime contract before optimizing storage.

Safe deferrals:

- typed-array allocation strategy.
- chunk compaction policy.
- generated query accessors.
- presentation-specific sorting caches.
- snapshot diffing and revision minimization.
- authoring helper package shape.

Do not defer the scene scope invariant, immutable component composition, or `flush()`/`publish()` separation. Those are foundation rules.
