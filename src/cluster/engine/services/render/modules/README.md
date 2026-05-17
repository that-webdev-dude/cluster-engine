# Render Modules

The render modules are private helpers used by `RenderService`.

- `Render2DPrepare` validates frame alpha, sorts layers and items, resolves
  renderer-domain items into prepared draw records, lowers bitmap text to glyph
  quads, preserves previous/current transform data for shader interpolation,
  and builds batches.
- `Render2DGeometryUpload` plans per-frame geometry uploads. Supported 2D
  primitives submit through compact instance streams and static or cached local
  geometry, not CPU-packed final clip-space vertices.
- `Render2DInstancePacking` writes quad, glyph, line, circle, and polygon
  instance data plus shared unit geometry constants.
- `Render2DGeometryLayout` holds private vertex layout metadata and portable
  pipeline descriptors used by backend pipeline compilers.
- `Render2DFrameUniforms` packs frame alpha, target, DPR, and camera values for
  backend shaders.
- `FrameBuilder` initializes per-frame target and stats data.
- `SubmitFrame` converts prepared batches into backend draw calls and submit
  metrics.
- `Interpolation` remains a small compatibility helper for non-instanced
  prepared fields; supported normal submission paths interpolate in shaders.

Do not import these modules from game, world, authored systems, or public
engine package barrels.
