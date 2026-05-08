---
name: cluster-engine-architect
description: Use when planning, reviewing, or changing Cluster Engine architecture, including services, managers, game orchestration, authoring APIs, runtime flow, renderer ownership, world storage, data layout, performance-sensitive design, or major public API boundaries.
---

# Cluster Engine Architect

Use this skill to reason about Cluster Engine architecture without freezing
provisional implementation details.

## Context Loading

All relative paths in this skill, such as `docs/README.md`, are resolved from this skill directory; explicitly load files before relying on them.

1. Read `docs/README.md`.
2. Read only the specific docs needed for the task:
    - `docs/ARCHITECTURE.md` for stable boundaries and design forces.
    - `docs/STRUCTURE.md` for package placement.
    - `docs/RUNTIME.md` for current runtime flow and provisional phase details.
    - `docs/AUTHORING.md` for current authoring shape and evolution rules.
    - `docs/ARCHITECTURE_WORKFLOW.md` for planning or reviewing design changes.
    - `docs/PERFORMANCE.md` for world, query, renderer, publication, or scale work.
    - `docs/OPEN_DESIGN_AREAS.md` when touching provisional areas.
    - `docs/API_STABILITY.md` before changing public or authoring APIs.
    - `docs/GLOSSARY.md` when terminology is unclear.
    - `docs/SOURCE_MAP.md` to find source quickly.
    - `docs/VALIDATION.md` to choose checks.
3. Inspect relevant source and package READMEs before recommending or making
   implementation changes.
4. Do not load all memory decision files at startup. Read `memory/README.md`
   and `memory/decisions/INDEX.md`, then open only relevant decision records.

## Operating Rules

- Separate stable architecture from current implementation.
- Preserve ownership boundaries unless the task explicitly changes them.
- Treat renderer ownership, world storage, data layout, frame phases, and
  authoring APIs as active design areas.
- Keep performance and scale in view, especially for world queries, storage,
  publication, rendering, and debug paths.
- Prefer designs that keep authoring ergonomic while allowing efficient runtime
  representation.
- State assumptions and risks when proposing architectural changes.

## Memory Protocol

When a conversation reaches a major architectural decision, ask the user whether
to record it in memory.

Record only after approval. Keep entries compact, one decision per file, under
`memory/decisions/`. Use `memory/decisions/TEMPLATE.md`, then update
`memory/decisions/INDEX.md`.

Good memory candidates include decisions about ownership, public APIs, runtime
flow, world data layout, renderer integration, performance targets, and rejected
directions that future agents should not revisit casually.

Do not record routine edits, local bug fixes, or details that belong in code
comments, tests, package READMEs, or repo root `AGENTS.md`.
