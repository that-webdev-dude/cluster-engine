# Decision 0012: WebGPU Reusable Frame Vertex Buffers

Date: 2026-05-10
Status: Accepted
Area: renderer/performance

## Decision

Phase 7 WebGPU 2D submission uses reusable per-layout frame vertex buffers that
grow as needed and are reused across frames. The first parity path avoids
per-batch GPU buffer allocation, while a full persistent or ring-buffer
architecture remains deferred to a later performance stage.

## Context

First WebGPU drawing needs behavioral parity with WebGL2 without making the
initial implementation the final hot path. Per-batch GPU buffer creation would
be obvious churn in real scenes, but implementing final streaming-buffer
architecture now would expand the phase beyond first submission parity.

## Consequences

- WebGPU 2D submitters should upload used vertex ranges into retained frame
  buffers rather than creating buffers per batch.
- Buffer growth can stay simple and geometric for now; ring buffers, arenas, and
  persistent streaming policies are later performance work.
- Future performance changes should preserve the private render boundary and
  avoid exposing backend buffers through public APIs.
