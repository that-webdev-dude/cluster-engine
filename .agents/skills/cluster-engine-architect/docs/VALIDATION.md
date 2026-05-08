# Validation

Choose focused validation for the touched architecture. Repo-specific commands
belong in root `AGENTS.md`; this file describes what to validate.

## By Change Type

- Lifecycle/service changes: lifecycle tests, start/stop/dispose ordering, no
  calls after dispose.
- Manager command changes: command queue ordering, flush visibility,
  stopped/disposed behavior, stable views.
- Runtime flow changes: frame pipeline tests, scene execution ordering, command
  visibility across phases.
- Authoring changes: authored-to-runtime adaptation, type checks, migration
  examples, ergonomics.
- World storage/query changes: query correctness, stale access behavior,
  mutation safety, allocation/copying review, scale probes where possible.
- Renderer-related changes: extraction boundaries, render timing, ownership of
  resources, interaction with world publication.

## Reporting

Always report what was actually run. If validation is not run, say why and name
the most relevant checks.
