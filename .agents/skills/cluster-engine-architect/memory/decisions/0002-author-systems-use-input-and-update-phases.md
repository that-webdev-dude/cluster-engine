# Decision 0002: Author Systems Use Input And Update Phases

Date: 2026-05-09
Status: Accepted
Area: authoring/runtime

## Decision

Author-facing game systems expose only `input` and `update` phases. The game
frame pipeline still runs `update` with fixed-step timing from `LoopService`,
but fixed-step mechanics are no longer part of the authored phase name. Render
preparation is removed from normal `GameSystem` execution and lives behind a
temporary read-only `GameConfig.prepareRender` pipeline boundary until a
renderer service owns extraction and draw preparation.

## Context

Decision 0001 made `LoopService` a timing primitive and moved phase sequencing
to `GameFramePipeline`. The old `fixedUpdate` and `preRender` system phases
leaked engine timing and render-preparation concerns into author systems, and
`preRender` could mutate simulation state through the normal `GameCtx`.

## Consequences

- `update` remains deterministic fixed-step execution for now, sequenced by
  `GameFramePipeline`.
- Author systems should not receive a render-preparation phase or writable
  simulation context for render work.
- `GameConfig.prepareRender` is a temporary bridge and should not be treated as
  the final renderer API.
