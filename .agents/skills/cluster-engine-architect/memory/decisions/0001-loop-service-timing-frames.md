# Decision 0001: Loop Service Reports Timing Frames

Date: 2026-05-09
Status: Accepted
Area: runtime

## Decision

LoopService owns frame-clock mechanics, fixed-step accumulation, update-step
counting, frame delta clamping, update cap reporting, and interpolation alpha
calculation. It reports update and render timing frames through callbacks
instead of directly invoking engine phases such as input, fixedUpdate,
preRender, or render. GameFramePipeline owns mapping those timing frames onto
current engine phase order.

## Context

The previous loop API exposed one callback per current engine phase, which made
the clock service responsible for orchestration semantics. Moving phase
sequencing into GameFramePipeline keeps LoopService narrow while leaving room
for future render preparation and author-facing phase redesigns.

## Consequences

- LoopService should remain a timing primitive, not a display, input,
  simulation, scene, world, or render phase owner.
- New engine phases should usually be added to GameFramePipeline or a domain
  service, not to LoopService.
- Future work may still rename or reduce author-facing phases independently of
  the loop API.
