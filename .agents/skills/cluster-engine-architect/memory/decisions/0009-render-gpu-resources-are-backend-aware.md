# Decision 0009: Render GPU Resources Are Backend-Aware

Date: 2026-05-10
Status: Accepted
Area: renderer/runtime/api

## Decision

Renderer GPU resource handles remain logical and backend-neutral, while native
GPU objects are stored only in backend-specific private state inside gpuResource
records. Retained uploads and resource-id mappings are logical resource state
and survive backend loss.

## Context

The renderer is preparing for WebGPU while preserving the boundary where game
owns extraction and driving, RenderFrameInput remains renderer-domain input,
and backend handles stay private. The previous resource records stored WebGL2
native objects directly, which made the logical resource model WebGL2-shaped.

## Consequences

- Public render APIs and RenderFrameInput do not expose GPU handles or backend
  resource descriptors.
- WebGL2 resource behavior continues through compatibility wrappers while
  internals become backend-aware.
- Future WebGPU resource creation can reuse the same logical texture, sampler,
  and buffer records without changing game or authored code.
