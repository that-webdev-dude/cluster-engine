# Structure

Current package structure and placement guidance. This layout is a useful
default, not a reason to reject architectural changes when a better ownership
boundary appears.

## Engine Root

Engine code currently lives under `src/cluster/engine/`.

```text
engine/
  controllers/  # shared lifecycle and orchestration helpers
  game/         # authored game API and game orchestration
  managers/     # lifecycle state owners
  services/     # lifecycle runtime/platform concerns
  systems/      # shared system contracts
  types/        # globally shared engine types
```

## Services

Services currently use this shape:

```text
services/<service_name>/
  README.md
  index.ts
  service/
    <Name>.service.ts
    <Name>.types.ts
    <Name>.view.ts
    <Name>.service.test.ts
  modules/
    <Concern>.module.ts
    <Concern>.module.test.ts
```

Use this structure for new services unless the service has a clear reason to
own a different internal model. Keep `index.ts` as the package boundary and keep
private implementation modules out of public exports.

## Managers

Managers currently use this shape:

```text
managers/<manager_name>/
  README.md
  index.ts
  <Name>.manager.ts
  <Name>.types.ts
  <Name>.runtime.types.ts
  service/
    <Name>Manager.service.ts
    <Name>Manager.types.ts
    <Name>Manager.view.ts
    <Name>Manager.service.test.ts
  modules/
    <Concern>.module.ts
    <Concern>.module.test.ts
  tools/
    index.ts
```

Root manager facades may exist for compatibility. Prefer package `index.ts` for
new imports.

Managers may add domain-specific folders when the model is large enough, such
as world `entity/` or `storage/`. For performance-sensitive domains, structure
should follow ownership and data layout rather than cosmetic symmetry.

## Game Package

The game package currently uses this shape:

```text
game/
  README.md
  index.ts
  service/
    Game.service.ts
    Game.types.ts
    Game.service.test.ts
  authoring/
    entity.ts
    scene.ts
    system.ts
  modules/
    <Concern>.module.ts
    <Concern>.module.test.ts
```

The game package owns composition and authored-to-runtime adaptation. It should
not absorb specialized renderer, world-storage, asset, or scheduling internals
unless they are truly orchestration concerns.

## Type Placement

- Public service and manager facade types live near the facade that exposes
  them.
- Domain types shared across a package can live at the package root.
- Runtime-only types can be separated when authored/domain types differ from
  mounted/runtime state.
- Module-local types should stay inside the module.
- Shared private types are allowed when several private modules coordinate one
  internal model.
- Globally shared engine types belong under `src/cluster/engine/types/`.
