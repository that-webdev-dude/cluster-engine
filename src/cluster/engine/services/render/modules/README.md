# Render Modules

The render modules are private helpers used by `RenderService`.

- `Render2DPrepare` validates frame alpha, sorts layers and items, resolves
  interpolation from previous/current transform data, lowers supported 2D
  primitives, and builds batches.
- `FrameBuilder` initializes per-frame target and stats data.
- `SubmitFrame` converts prepared batches into backend draw calls and submit
  metrics.
- `Interpolation` contains the temporary CPU-side interpolation helper used by
  preparation until backend-side interpolation becomes the preferred hot path.

Do not import these modules from game, world, authored systems, or public
engine package barrels.
