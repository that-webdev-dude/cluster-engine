# Cluster Engine Local Patterns

Use `.agents/skills/cluster-engine-architect/SKILL.md` before changing service,
manager, game orchestration, runtime flow, or public engine API boundaries.

## Services

When asked to scaffold a service or adapt a legacy runtime concern, follow the
existing `display`, `input`, and `loop` shape. A service owns one cohesive
runtime/platform concern, keeps mutable state private, uses
`createLifecycle(...)`, and exposes only the narrow API the orchestrator or
systems need.

```ts
export type FooService = Readonly<{
    view: FooView;
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    latch(frame?: FooFrame): void;
    dispose(): Promise<boolean>;
}>;

export function createFoo(config: FooConfig): FooService {
    const lifecycle = createLifecycle({ tag: "FooService", debug });

    function latch(frame?: FooFrame): void {
        lifecycle.assertNotDisposed();
        if (!lifecycle.isRunning()) return;
        // publish frame-stable state here
    }

    return Object.freeze({
        view,
        start: lifecycle.start,
        stop: lifecycle.stop,
        latch,
        dispose: lifecycle.dispose,
    });
}
```

Use `service/*.types.ts` for config/view/snapshot types, `service/*.view.ts`
for frozen read-only views, `modules/*.module.ts` for private helpers, and
`index.ts` to export the factory plus public types. Services that drive work
instead of publishing state, such as `LoopService`, may expose callbacks rather
than `view` or `latch`.

---

## Managers

Before creating or adapting a manager, inspect the current manager examples in
`src/cluster/engine/managers/scene/` and `src/cluster/engine/managers/world/`.
Managers are lifecycle-managed owners of engine state. They expose queued
commands for structural mutation, apply them at `flush()`, and expose reads via
`view`, `query(...)`, or execution methods.

```ts
export type FooManagerService = Readonly<{
    view: FooManagerView;
    commands: { readonly request: FooRequestCommands };
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    flush(): void;
    publish?(): void;
    query?(...args: FooQueryArgs): readonly FooQueryRow[];
    dispose(): Promise<boolean>;
}>;

function flush(): void {
    lifecycle.assertNotDisposed();
    if (!lifecycle.isRunning()) return;
    commandQueue.flush({ add: applyAdd, remove: applyRemove });
}
```

Keep storage/scheduling internals behind modules, expose command APIs instead
of direct mutation, and keep publication separate from mutation when snapshots
are needed. Manager indexes should mirror existing exports: factory and service
type from `service/*.service.ts`, public API types from `service/*.types.ts`,
and domain types from adjacent files.

---

## Error Messaging

when in debug mode throw errors loudly where appropriate. use the existing example as a template
for error messaging and keep consistency across every part of the framework:

```ts
if (debug) {
    throw new Error(
        "LoopService.assertRequestFrameNotUndefined: platform requestFrame is required",
    );
}
```
