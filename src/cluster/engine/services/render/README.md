# Render Service

Render is a sealed engine service domain. It receives renderer-owned
`RenderFrameInput`, prepares renderer state through `prepare(...)`, and submits
prepared work through `execute()`.

Phase 1 intentionally provides only the package shell, lifecycle surface,
public view, and private module boundaries. The renderer does not consume world,
scene, entity, query row, manager view, or legacy published-frame types.

Full WebGL2 resource, pipeline, shader, texture upload, context-loss, and draw
submission behavior is deferred to Phase 4 after the renderer-domain input
contract and preparation path are defined.
