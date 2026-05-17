# Render Gfx Backend

`gfxBackend` is a private render subservice for graphics runtime ownership.

It acquires either a WebGL2 context or a WebGPU adapter/device/surface from the
configured canvas, reads a small capability snapshot, tracks loss and recovery
state, and exposes the active private runtime to render submission code. It does
not submit frames, compile pipelines, own GPU resources, or expose a public
engine API.

Render service starts, stops, latches, and disposes this subservice.
