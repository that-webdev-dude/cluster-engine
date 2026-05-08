# Architecture Workflow

Use this workflow for architectural planning, reviews, and implementation.

## Steps

1. Identify the affected ownership boundary: service, manager, game,
   authoring, runtime flow, renderer, world storage, or public API.
2. Read only the docs relevant to that boundary.
3. Check `memory/decisions/INDEX.md` for related decisions. Load full decision
   files only when the index shows they may apply.
4. Inspect current source before proposing changes.
5. Separate current implementation from the invariant the design must preserve.
6. Present options when there is a real design choice.
7. Recommend the smallest design that protects future renderer, world, and
   authoring flexibility.
8. Define validation before or alongside implementation.
9. If the user approves a major decision, ask whether to record it in memory.

## Decision Checklist

- Which package owns this concern?
- Does this expose or freeze a provisional API?
- Does this constrain world storage, renderer extraction, scheduling, or
  authoring shape?
- What changes for high entity counts?
- What must be validated for correctness and scale-sensitive behavior?
