# Decision 0011: Shared Private 2D Vertex Packing

Date: 2026-05-10
Status: Accepted
Area: renderer/runtime/api

## Decision

WebGL2 and WebGPU 2D submission share private renderer-owned vertex packing for
existing prepared 2D batches. The shared packing stays below the render service
boundary and does not change `RenderFrameInput`, public render exports, or game
extraction and driving ownership.

## Context

Phase 7 adds the first WebGPU 2D submit path. WebGPU needs the same solid and
textured batch geometry as WebGL2, but duplicating packing logic would create
parallel backend behavior and make future parity fixes harder. Sharing the
packer keeps the portable prepared-frame contract stable while allowing backend
submitters to choose private pipeline and resource details.

## Consequences

- 2D geometry fixes should land in the shared private packing module before
  backend-specific submitters.
- Backend handles, pipeline objects, and resource bindings remain private to
  render internals.
- Game extraction and `RenderFrameInput` remain unchanged by WebGPU submission
  work.
