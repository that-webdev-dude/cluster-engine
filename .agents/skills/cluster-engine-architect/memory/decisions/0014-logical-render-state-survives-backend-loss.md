# Decision 0014: Logical Render State Survives Backend Loss

Date: 2026-05-10
Status: Accepted
Area: renderer/runtime/api

## Decision

Logical GPU resources and portable pipeline descriptors survive backend loss.
Native WebGL2/WebGPU objects are destroyed or dropped on loss and recreated
lazily after recovery.

## Context

Phase 8 hardens recovery across WebGL2 and WebGPU without exposing backend
handles or requiring game/authored code to re-register renderer resources.

## Consequences

- Retained texture uploads remain logical state and are replayed after recovery.
- Fallback resources remain renderer-owned logical registrations.
- Pipeline cache keys/descriptors remain backend-neutral, while compiled native
  pipeline/program objects are invalidated on loss.
