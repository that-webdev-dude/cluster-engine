# Render GPU Resource

`gpuResource` is a private render subservice for renderer-owned GPU handles and
uploads.

It owns texture resource registration, retained texture uploads, fallback
texture resolution, transient vertex buffers, upload flushing, and resource
release. Public game, world, and authored code should refer only to renderer
resource ids in `RenderFrameInput`; they should not receive these handles.

The current implementation targets WebGL2. Longer-lived resource policy and
asset integration remain provisional.
