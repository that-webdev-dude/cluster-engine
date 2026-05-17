# Render GPU Resource

`gpuResource` is a private render subservice for renderer-owned GPU handles and
uploads.

It owns texture resource registration, retained texture uploads, fallback
texture resolution, transient per-layout instance buffers, static unit geometry,
cached polygon geometry, upload flushing, and resource release. Public game,
world, and authored code should refer only to renderer resource ids in
`RenderFrameInput`; they should not receive these handles.

Logical resource handles are backend-neutral. Native backend objects live behind
backend-specific private record state. Both WebGL2 and WebGPU submitters use
private compatibility wrappers to resolve native textures, frame buffers, and
static/cached geometry without exposing backend handles.

Longer-lived resource policy and asset integration remain provisional.
