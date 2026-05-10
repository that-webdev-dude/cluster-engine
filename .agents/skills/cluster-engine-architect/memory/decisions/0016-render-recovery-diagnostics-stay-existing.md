# Decision 0016: Render Recovery Diagnostics Stay Existing

Date: 2026-05-10
Status: Accepted
Area: renderer/runtime/api

## Decision

Recovery diagnostics stay limited to the existing backend diagnostic fields:
`state`, `lostBackend`, `selectedBackend`, and fallback fields. Phase 8 does
not add new public or forwarded recovery diagnostics.

## Context

Render diagnostics should remain useful without exposing backend internals or
turning recovery mechanics into public API.

## Consequences

- `RenderView` remains unchanged for Phase 8 recovery.
- Backend handles, caps, and recovery progress stay private to render internals.
- Future diagnostic expansion should be deliberate and guarded by public-surface
  tests.
