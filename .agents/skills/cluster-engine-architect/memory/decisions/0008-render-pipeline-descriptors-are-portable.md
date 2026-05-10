# Decision 0008: Render Pipeline Descriptors Are Portable

Date: 2026-05-10
Status: Accepted
Area: renderer/runtime/api

## Decision

Render pipeline descriptors describe renderer intent using shader family, pass
key, material key, primitive kind, blend mode, and vertex layout key. Backend
shader source selection belongs inside backend-specific pipeline compilers,
starting with WebGL2 GLSL selection inside the render pipeline library.

## Context

The renderer is adding WebGPU support while preserving the existing boundary
where game owns extraction and driving, RenderFrameInput remains renderer-domain
input, and backend handles stay private. The previous pipeline descriptor shape
carried GLSL source and WebGL2-prefixed keys, which made the core pipeline model
backend-shaped.

## Consequences

- Pipeline descriptors remain private render internals and are not exported
  through the public render package barrel.
- WebGL2 and future WebGPU compilers can map the same renderer-intent descriptor
  to backend-specific shader sources and native pipeline objects.
- Pipeline cache keys are computed from normalized descriptor intent, not
  caller-authored backend-specific strings.
