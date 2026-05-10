# Decision 0005: Render Extraction Adapter Is Transitional

Date: 2026-05-10
Status: Accepted
Area: renderer/world/runtime

## Decision

The Phase 5 game-owned render extraction adapter may consume today's world
query rows and temporary component-name conventions, but that shape is only a
bridge. Future ECS/world storage should be free to replace the adapter internals
or source reader without changing `RenderFrameInput` or the render service API.

## Context

The current world manager exposes live row-object queries, while the renderer
now accepts sealed renderer-domain `RenderFrameInput`. Phase 5 needs a practical
adapter between them, but world storage is expected to become a faster ECS-style
manager and authored entity shape may also evolve. Without recording this, the
temporary extraction details could be mistaken for a stable render/world
contract.

## Consequences

- The adapter can use current query rows internally, including temporary joins
  by entity id, without promoting those rows to renderer API.
- Renderer input remains the stable handoff; world storage and authoring may
  change behind the extraction boundary.
- Future ECS work should replace or re-source extraction rather than make ECS
  storage mimic the temporary row-object adapter.
