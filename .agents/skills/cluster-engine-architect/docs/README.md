# Cluster Engine Architecture Context V2

Reference set for a repo-specific `cluster-engine-architect` skill.

These documents intentionally separate durable architecture from current
implementation details. Cluster Engine is under active design. A useful agent
should preserve important boundaries while staying open to better renderer,
world, data-layout, and authoring designs.

## Reading Order

1. `ARCHITECTURE.md` for stable ownership boundaries, design forces, and
   performance goals.
2. `STRUCTURE.md` for current package layout and placement conventions.
3. `ARCHITECTURE_WORKFLOW.md` for planning, reviewing, or implementing
   architectural changes.
4. `SOURCE_MAP.md` to find the relevant source area quickly.
5. One or more focused references:
   - `RUNTIME.md` for runtime flow.
   - `AUTHORING.md` for authoring APIs.
   - `PERFORMANCE.md` for scale-sensitive design.
   - `OPEN_DESIGN_AREAS.md` for provisional areas.
   - `API_STABILITY.md` before public API changes.
   - `GLOSSARY.md` when terminology is unclear.
   - `VALIDATION.md` before choosing checks.
6. Relevant package `README.md` files and source before making or recommending
   implementation changes.

## Source Of Truth

- Source code is authoritative when behavior is in question.
- These docs are architectural guidance, not a lock on current mechanics.
- Package `README.md` files describe local intent, but source should still be
  checked before changing behavior.
- Current implementation details are examples of where the engine is today, not
  promises that the design should stay there.
- Memory decision records may override older intent. Check the memory index
  before revisiting major architecture.

## Skill Posture

A `cluster-engine-architect` skill should:

- preserve ownership boundaries unless the task is explicitly architectural;
- avoid freezing provisional APIs into permanent architecture;
- treat performance and data-oriented design as first-class constraints;
- distinguish facts from assumptions and current mechanics from desired
  invariants;
- look for designs that keep authoring ergonomic without constraining runtime
  layout;
- propose focused validation for both correctness and scale-sensitive behavior.

Repo-local commands, temporary migration notes, and implementation rules belong
in the repo root `AGENTS.md`.
