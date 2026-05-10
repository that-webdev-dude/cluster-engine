# Render GPU Resource

`gpuResource` is a private render subservice for renderer-owned GPU handles and
uploads.

It owns texture resource registration, retained texture uploads, fallback
texture resolution, transient vertex buffers, upload flushing, and resource
release. Public game, world, and authored code should refer only to renderer
resource ids in `RenderFrameInput`; they should not receive these handles.

Logical resource handles are backend-neutral. Native backend objects live behind
backend-specific private record state, with the active WebGL2 path exposed
through compatibility wrappers used by the WebGL2 submitter. WebGPU-ready
descriptor fields exist only as render internals until device and surface
ownership land.

Longer-lived resource policy and asset integration remain provisional.
