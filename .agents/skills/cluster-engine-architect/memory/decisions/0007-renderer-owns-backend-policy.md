# Decision 0007: Renderer Owns Backend Policy

Date: 2026-05-10
Status: Accepted
Area: renderer/runtime/api

## Decision

Render owns backend selection policy internally. Game, authored systems, and
public render-domain input must not choose WebGPU versus WebGL2, and native
backend handles plus capability details stay private to render internals.

## Context

The WebGPU foundation needs a private backend runtime model without widening the
public render boundary. Existing decisions keep game responsible for extraction
and render driving while render receives sealed `RenderFrameInput`.

## Consequences

- Do not add a public backend preference to `RenderConfig` or
  `RenderFrameInput`.
- Future internal selection should prefer WebGPU, fall back to WebGL2, then use
  `none`.
- Public `RenderView` may report selected backend/state diagnostics, but not
  caps or native handles.
