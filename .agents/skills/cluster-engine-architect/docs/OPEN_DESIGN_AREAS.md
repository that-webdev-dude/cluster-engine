# Open Design Areas

These areas are intentionally not settled. Do not treat current implementation
details as final architecture.

## Renderer Service

- Ownership of draw work is not finalized.
- Renderer extraction should not fight world storage layout.
- Render timing, interpolation, and resource ownership are open.

## World Storage

- Final data layout is not defined.
- Query APIs, component schemas, handles, compaction, sleeping/stored entities,
  and debug publication are open design areas.

## Authoring

- Current `entity`, `scene`, and `system` helpers are provisional.
- Future authoring may include schemas, prefabs, resources, render definitions,
  query declarations, or separate authored/runtime component models.

## Runtime Flow

- Current phases are implementation details.
- Input sampling, fixed/variable update boundaries, pre-render work, renderer
  handoff, and publication timing may change.

## Scheduling

- Current system execution is simple.
- Future scheduling may need access declarations, ordering groups, parallelism,
  phase changes, or render extraction passes.
