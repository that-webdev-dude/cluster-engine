# Decision 0013: Render Recovery Driven By Execute

Date: 2026-05-10
Status: Accepted
Area: renderer/runtime/api

## Decision

Render backend recovery is driven privately by `RenderService.execute()`.
Recovery does not add public controls, authored hooks, game callbacks, or
`RenderFrameInput` fields.

## Context

Phase 8 adds backend loss recovery while preserving the existing render
boundary: game owns extraction and driving, render owns private graphics,
resource, pipeline, and submission internals.

## Consequences

- Game code continues to call `prepare(input)` and `execute()` only.
- Lost frames may be skipped while private recovery is attempted.
- Future recovery changes must stay below the public render package boundary.
