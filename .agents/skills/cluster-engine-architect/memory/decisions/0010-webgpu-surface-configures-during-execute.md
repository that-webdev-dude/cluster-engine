# Decision 0010: WebGPU Surface Configures During Execute

Date: 2026-05-10
Status: Accepted
Area: renderer/runtime

## Decision

WebGPU canvas surface configuration happens inside `RenderService.execute()`
using the last target accepted by `RenderService.prepare(input)`.
`prepare(input)` remains renderer-domain frame preparation, while backend
surface readiness belongs to the render execution phase.

## Context

Phase 6 adds WebGPU device and canvas-context ownership without drawing yet.
The renderer boundary already keeps game responsible for extraction and driving,
with `RenderFrameInput` carrying renderer-domain target size and DPR. Choosing
`execute()` keeps backend-specific surface work near backend synchronization and
submission gating instead of mixing it into preparation.

## Consequences

- Future WebGPU resize and DPR handling should use the latest prepared target at
  render execution time.
- `prepare(input)` should not acquire, configure, or expose backend surface
  handles.
- Backend handles remain private to render internals, and WebGPU submission can
  evolve later without changing game-owned extraction or `RenderFrameInput`.
