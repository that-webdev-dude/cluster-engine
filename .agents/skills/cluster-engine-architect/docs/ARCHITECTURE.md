# Architecture

Broad architecture guidance for Cluster Engine. This document describes the
model the engine is growing toward, not a frozen contract for every current API.

## Design Forces

- The engine should support large worlds: tens of thousands of active entities
  should be normal, and designs should leave room for much larger stored worlds.
- Runtime data layout matters. Authoring convenience must not force inefficient
  storage, iteration, query, rendering, or publication strategies.
- Services and managers should make ownership explicit so large-scale behavior
  can be optimized without hidden cross-module coupling.
- Frame boundaries should make state visibility predictable, but exact phases
  may evolve as rendering, simulation, and world storage become clearer.
- Debug and publication paths should not dominate runtime cost at scale.

## Stable Boundaries

- Services own platform-facing or runtime concerns, such as display, input, loop
  timing, and future rendering.
- Managers own engine state and structural mutation, such as scenes and world
  data.
- The game package is the composition root for authored-game usage. It wires
  services, managers, authoring adaptation, and frame orchestration.
- Systems should depend on explicit context APIs instead of browser APIs,
  service internals, manager storage, or event streams directly.
- Structural mutation should cross command or scheduling boundaries rather than
  letting arbitrary callers mutate owned storage in place.

## Services

Services are lifecycle-managed runtime units. They hide mutable implementation
details behind narrow public APIs and may publish read-only views when other
systems need stable state.

The exact service set is expected to grow. In particular, rendering is still an
open architectural area. New services should be introduced only when they own a
cohesive runtime concern and reduce coupling.

## Managers

Managers are lifecycle-managed state owners. They usually expose command APIs
for structural changes and query or view APIs for reads.

The world manager is the most performance-sensitive manager. Its public shape
should not be allowed to hard-code a poor data layout. Prefer APIs that can be
implemented with chunked, archetype, sparse-set, streaming, or other
data-oriented storage strategies later.

## Game Orchestrator

The game orchestrator creates and coordinates core services and managers. It
adapts authored scenes into runtime scenes and builds the context systems use.

Current orchestration is useful precedent, but not a permanent final design.
Frame passes, context shape, publication timing, and render ownership may change
as the renderer and world storage mature.

## Authoring

The authoring layer should stay ergonomic, but it is not allowed to dictate
runtime layout. Authored entities, systems, scenes, and future resource/render
definitions should compile or adapt into efficient runtime structures.

When evolving authoring APIs, preserve this direction:

- author code should be pleasant and portable;
- runtime systems should still get efficient access patterns;
- scene ownership and world ownership should remain separate;
- high-level convenience should not bypass manager/service boundaries.
