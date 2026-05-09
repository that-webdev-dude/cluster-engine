# Decision 0003: Renderer Receives Render Frame Input

Date: 2026-05-09
Status: Accepted
Area: renderer/runtime/api

## Decision

Render is a sealed service domain that receives renderer-owned
`RenderFrameInput`, not world snapshots, scene objects, entities, query rows,
store records, manager views, or `WorldManager.view.debug`. The render service
owns `prepare(input)` for render-domain validation, normalization, sorting,
lowering, batching, resource resolution, and backend upload preparation, then
owns `execute()` for backend submission, submit metrics, and per-frame
cleanup or reuse.

## Context

The legacy renderer prototype owned backend selection, GPU resources, pipeline
libraries, frame construction, 2D lowering, and backend submission, but its
historical input bridge should not become the future engine contract. Current
runtime decisions keep `LoopService` focused on timing frames and keep authored
systems limited to `input` and `update`, leaving render preparation behind a
pipeline boundary. Recording this boundary now lets the renderer port move into
the engine without coupling render internals to world storage, scene ownership,
or temporary debug publication shapes.

## Consequences

- The initial public renderer input name is `RenderFrameInput`.
- The initial render service API exposes lifecycle methods, texture
  registration, `prepare(input: RenderFrameInput)`, and `execute()`.
- Extraction from world or game data happens outside the render service.
- The final extraction owner remains open for later game, world, or render
  integration work.
