# Render Gfx Backend

`gfxBackend` is a private render subservice for graphics runtime ownership.

It currently acquires a WebGL2 context from the configured canvas, reads a small
capability snapshot, tracks context-loss state, and exposes the active runtime
to render submission code. It does not submit frames, compile pipelines, own GPU
resources, or expose a public engine API.

Render service starts, stops, latches, and disposes this subservice.
