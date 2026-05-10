# Decision 0004: Render 2D Input And Interpolation Scope

Date: 2026-05-10
Status: Accepted
Area: renderer/runtime/api

## Decision

The first renderer-owned 2D input contract supports layers of rect, sprite,
circle, ellipse, polygon, and line items, but intentionally excludes text until
font or glyph resource registration, atlas ownership, metrics, and layout are
designed. Render accepts previous and current render-domain transform data and
owns interpolation from that data plus frame alpha.

## Context

The renderer public input contract shapes later extraction and world renderable
storage, so it should support common 2D primitives without prematurely
promising resource-heavy text rendering. Previous/current transform data is
needed for renderer-owned interpolation, but render must remain sealed from
world, scene, entity, query, and manager storage.

## Consequences

- Text rendering is future work tied to a font or glyph resource model.
- GPU-side interpolation remains the preferred backend path; CPU interpolation
  is only a temporary fallback or test path.
- Previous/current syncing is an extraction or frame-boundary responsibility,
  not normal user code and not render-service mutation of world state.
