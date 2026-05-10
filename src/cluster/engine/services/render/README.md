# Render Service

Render is a sealed engine service domain. It receives renderer-owned
`RenderFrameInput`, prepares renderer state through `prepare(...)`, and submits
prepared work through `execute()`.

Phase 1 intentionally provides only the package shell, lifecycle surface,
public view, and private module boundaries. The renderer does not consume world,
scene, entity, query row, manager view, or legacy published-frame types.

The first renderer-domain input contract supports ordered 2D layers containing
rectangles, sprites, circles, ellipses, polygons, and lines. Text is
intentionally deferred: GPU text needs a font or glyph resource model, atlas
ownership, metrics and layout rules, and a future registration API such as
font resources rather than ad hoc item fields.

Interpolation is renderer-owned. Render input may carry previous and current
render-domain transform data, and the renderer uses `alpha` during preparation.
The current CPU interpolation path is a temporary fallback for tests and the
no-backend shell; the preferred backend path is GPU-side interpolation once
the shader and pipeline implementation exists. Previous/current value capture
belongs to the later extraction or frame-boundary owner, not to ordinary user
code and not to render mutating world state.

WebGL2 is the first backend path. Resource registration, texture upload,
fallback textures, pipeline compilation, context-loss state, and draw
submission stay private to the render service. WebGPU parity, richer resource
lifetimes, and GPU-side interpolation remain later renderer work.
