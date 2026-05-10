# Decision 0006: Game Owns Render Service Wiring

Date: 2026-05-10
Status: Accepted
Area: renderer/runtime/api

## Decision

`createGame(...)` owns render service lifecycle and frame driving. Game prepares
renderer-domain input at the render preparation boundary, calls
`render.prepare(...)`, and calls `render.execute()` during the render phase.
Authored systems remain limited to input and update phases, and
`GameConfig.prepareRender` is removed rather than kept as a parallel hook.

## Context

The renderer now accepts sealed `RenderFrameInput`, and Phase 5 added a
transitional game-owned extraction adapter from current world storage. Phase 6
wires that boundary into the main game runtime. Keeping an ad hoc
`prepareRender` hook alongside automatic extraction would create a competing
render path and blur ownership between authored game code, game orchestration,
and the render service.

## Consequences

- Game owns render service start, stop, dispose, prepare, and execute ordering.
- Authored systems do not gain a render phase or renderer internals through
  `GameCtx`.
- Render debug state is exposed through `GameDebugView.render` as renderer view
  data, not renderer internals.
