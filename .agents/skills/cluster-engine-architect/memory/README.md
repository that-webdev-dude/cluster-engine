# Architectural Memory

Compact decision records for Cluster Engine architecture.

## Loading Rules

- Do not load every memory file at startup.
- Read this README and `decisions/INDEX.md` first.
- Use the index as the first filter by area, status, and summary.
- Open full decision records only when they may affect the current task.

## When To Record

Ask the user before recording decisions that affect:

- ownership boundaries;
- public APIs or authoring APIs;
- runtime frame flow or lifecycle ordering;
- world storage, data layout, query, or publication strategy;
- renderer ownership or extraction flow;
- performance targets or scale assumptions;
- rejected architectural directions that future agents should not rediscover.

Do not record routine implementation details, small bug fixes, or temporary
workarounds.

## Decision Format

Use one compact file per decision under `memory/decisions/`, based on
`memory/decisions/TEMPLATE.md`. After adding or changing a decision, update
`memory/decisions/INDEX.md`.

```md
# Decision 0001: Short Title

Date: YYYY-MM-DD
Status: Proposed | Accepted | Superseded
Area: world | renderer | authoring | runtime | api | performance | other

## Decision

One short paragraph.

## Context

Why this matters.

## Consequences

- Practical effect.
- Follow-up constraint.
```
