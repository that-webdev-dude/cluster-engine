# Render Next Implementation Stages

This document describes the next three major render implementation stages after
the integrated game-owned render demo and legacy fencing work.

The current renderer has a useful architectural nucleus: `RenderFrameInput` is
sealed from world and scene state, game owns extraction and render driving, and
render owns private graphics, GPU resource, pipeline, preparation, and
submission modules. The next work should build on that boundary without turning
temporary WebGL2 or current world-query details into permanent architecture.

## 1. Backend Abstraction And WebGPU Foundation

This stage should happen first because WebGPU affects the renderer substrate:
device ownership, resource lifetime, shader language, pipeline descriptors,
buffer uploads, loss recovery, metrics, and backend selection.

Current implementation pressure:

- `RenderBackend` only supports `none` and `webgl2`.
- `GfxRuntime` exposes a WebGL2 context directly.
- pipeline descriptors are GLSL/WebGL2 shaped.
- `SubmitFrame` owns WebGL2 shader source and draw submission in one module.
- GPU resource records know WebGL2 objects directly.

Target outcome:

- Extend the private backend model to represent both WebGL2 and WebGPU runtime
  handles while keeping the public render package barrel narrow.
- Add backend selection policy, capability reporting, and clear debug metrics
  for selected backend, unavailable backend, lost backend, and fallback path.
- Split backend-specific submitters so WebGL2 and WebGPU submission can evolve
  independently behind `RenderService.execute()`.
- Make pipeline descriptors backend-portable enough to describe shader family,
  vertex layout, blend mode, primitive kind, and pass/material keys without
  baking GLSL-only details into core render flow.
- Make GPU resource ownership express textures, samplers, uniform/storage
  buffers, transient frame buffers, and retained uploads in a way both WebGL2
  and WebGPU can implement.
- Add context/device loss handling tests for both backend paths.

Important constraint:

- Do not expose backend runtime handles through `GameCtx`, `RenderFrameInput`,
  or public authored APIs. Backend selection and device details stay inside the
  render service domain.

## 2. Text And Font Rendering System

Text should be its own resource and layout stage, not a quick primitive field.
Font and glyph handling affects resource registration, atlas lifetime, layout,
metrics, batching, fallback behavior, and rendering quality.

Current implementation pressure:

- text is intentionally deferred from the public 2D item contract.
- resources only cover raw texture registration.
- there is no font id, glyph atlas, shaped run, glyph metrics, fallback font, or
  text layout model.
- current batching groups by primitive pipeline and resource id, which is not
  enough for atlas pages and text-specific material state.

Target outcome:

- Add renderer-owned font or glyph resource registration with explicit ids,
  metrics, atlas ownership, cache invalidation, and debug counters.
- Define the first text input contract deliberately. A good first target is a
  renderer-domain text run that can carry font id, text content or pre-shaped
  glyphs, position, color/tint, opacity, max width or clipping metadata, and
  sort/material keys.
- Choose and document the first text rendering strategy: bitmap font,
  SDF/MSDF, browser-rasterized atlas, or pre-baked glyph atlas. Do not mix
  strategies accidentally.
- Add text preparation that converts text input into glyph draw records without
  leaking font internals into game/world code.
- Add backend submit support for text atlases and text material pipelines.
- Add tests for glyph resource registration, missing glyph/font fallback,
  atlas page batching, stable text metrics, and debug counters.

Important constraint:

- Keep text layout policy renderer-owned. Authored/game code may supply text
  intent, but glyph cache handles, atlas pages, and backend text pipelines stay
  private to render.

## 3. Hot-Path Performance Architecture

This stage turns the renderer from a correct integration into a production-grade
runtime path. It should follow the backend foundation and text strategy because
both affect the final data layout, batching keys, shader inputs, and upload
model.

Current implementation pressure:

- game extraction performs multiple current-world queries and joins optional
  data with maps per frame.
- preparation stores object records and resolves transforms on the CPU.
- submission writes CPU vertices for every batch and creates transient GPU
  buffers during submission.
- circle, ellipse, polygon, and line lowering all happen on CPU.
- debug metrics exist, but there are no scale probes or allocation budgets.

Target outcome:

- Replace object-heavy prepared frames with typed arenas or compact command
  streams for items, transforms, materials, batches, and draw commands.
- Move interpolation to backend shader inputs where practical by uploading
  previous/current transform data plus alpha instead of CPU-resolved vertices.
- Use persistent, ring-buffered, or pooled GPU buffers for transient frame data
  instead of creating buffers per submitted batch.
- Add renderer-owned culling, stable material/pipeline/resource sort keys, and
  batch keys that minimize draw calls without violating layer order.
- Keep fallback CPU lowering only where it is intentional, tested, and visible
  in metrics.
- Replace the transitional extraction hot path when world storage evolves, so
  render extraction can read dense/chunked renderable data without changing
  `RenderFrameInput`.
- Add performance validation for thousands and tens of thousands of active
  renderables, including allocation counts, upload bytes, batch count, draw call
  count, and frame time probes.

Important constraint:

- Do not optimize by coupling render directly to world storage internals. The
  extraction source may become faster, but the render service should still
  receive renderer-domain input or a renderer-owned equivalent handoff.

## Recommended Order

1. Build the backend abstraction and WebGPU-ready resource/pipeline substrate.
2. Add text through a proper font/glyph resource and layout pipeline.
3. Rework the hot path around typed arenas, backend interpolation, persistent
   uploads, culling, batching, and scale validation.

Doing text before the backend substrate risks redesigning text resources and
pipelines for WebGPU later. Doing deep performance first risks optimizing the
wrong CPU vertex path before the backend and text data shapes are known.
