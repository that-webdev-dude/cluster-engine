# Glossary

- Authoring: User-facing definitions created before runtime, such as scenes,
  entities, and systems.
- Command buffer: A queue of requested structural changes applied at a chosen
  boundary.
- Flush: The boundary where queued structural changes become live state.
- Game orchestrator: The game package service that composes services, managers,
  authored scene adaptation, and frame flow.
- Manager: Lifecycle state owner for engine state and structural mutation.
- Publish: The boundary where live state is copied or exposed as a stable read
  view.
- Runtime scene: Scene-manager representation produced from authored scenes.
- Service: Lifecycle unit that owns one platform-facing or runtime concern.
- Snapshot: Stable read representation of state at a point in time.
- Store: World ownership scope, currently tied to scene instances.
- System: User or engine logic executed by the scheduler within a phase.
- View: Read-oriented public API exposed by a service or manager.
