# Performance And Scale

Cluster Engine is intended to support large worlds and high entity counts.
Performance considerations are architectural, not late-stage polish.

## Goals

- Tens of thousands of active entities should be an ordinary design target.
- Much larger stored worlds should remain possible.
- Runtime storage should support cache-friendly iteration and predictable
  mutation costs.
- Debug, publication, and rendering extraction should avoid whole-world work
  unless explicitly requested.

## Design Pressures

- Separate authored convenience from runtime representation.
- Prefer APIs that can support dense queries, batching, streaming, and
  renderer-friendly extraction later.
- Avoid public contracts that require per-entity object churn on hot paths.
- Treat allocation, copying, stale handles, and compaction as explicit design
  concerns.
- Keep inactive, sleeping, stored, or streamed entities from imposing active
  simulation costs.

## Review Questions

- What is the hot path?
- Does this allocate per entity, per component, per query row, or per frame?
- Does this require copying large world state for debug or rendering?
- Can the API be implemented with chunked, archetype, sparse-set, or other
  data-oriented storage?
- What happens at 10k active entities? What happens with far more stored
  entities?
