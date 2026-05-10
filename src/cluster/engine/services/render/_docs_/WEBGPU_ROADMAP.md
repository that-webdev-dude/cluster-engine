# WebGPU Roadmap

This roadmap breaks Stage 1, Backend Abstraction And WebGPU Foundation, into
compact implementation phases. Each phase should preserve the current render
boundary: game owns extraction and driving, `RenderFrameInput` stays
renderer-domain input, and backend runtime handles remain private to the render
service package.

## Phase 1 ✅: Backend Runtime Model

Introduce a private backend model that can represent `none`, `webgl2`, and
`webgpu` without changing public render input.

- Extend `RenderBackend` and render diagnostics to include `webgpu`.
- Replace the single WebGL2-shaped `GfxRuntime` with a discriminated union.
- Keep WebGL2 acquisition behavior unchanged while the new model lands.
- Add capability fields that make sense for both APIs, leaving backend-specific
  caps optional.
- Validate render public-surface tests still protect the narrow package barrel.

## Phase 2 ✅: Backend Selection And Diagnostics

Add backend selection policy and clear debug state for unavailable or lost
backends.

- Prefer an internal `auto` policy first: WebGPU when available, WebGL2
  fallback, then `none`.
- Consider a `RenderConfig` backend preference only if explicit selection is
  needed for tests or demos.
- Track selected backend, fallback backend, unavailable requested backend, and
  loss state in `gfxBackend`.
- Add WebGPU feature detection behind safe browser capability checks.
- Test WebGPU unavailable, WebGL2 fallback, no backend, and lost-state latching.

## Phase 3 ✅: Submitter Split

Separate backend-neutral frame submission from backend-specific draw code.

- Keep `SubmitFrame` as the small coordinator used by `RenderService.execute()`.
- Move current WebGL2 shader source, vertex layouts, GL binding, upload, and
  draw calls into a private WebGL2 submitter module.
- Add a WebGPU submitter module with a minimal no-op or unsupported path first.
- Dispatch by `runtime.backend` and preserve existing submit result semantics.
- Test no-frame, no-submitter, lost-backend, empty-frame, and WebGL2 submitted
  paths through the coordinator.

## Phase 4 ✅: Portable Pipeline Descriptors

Make pipeline records describe renderer intent instead of GLSL source.

- Describe shader family, pass key, material key, primitive kind, blend mode,
  and vertex layout key in the core descriptor.
- Move GLSL source selection to the WebGL2 pipeline compiler.
- Add room for WGSL source selection inside the future WebGPU compiler.
- Preserve cache invalidation on backend change or loss.
- Test descriptor normalization, cache keys, backend invalidation, and WebGL2
  recompilation after loss.

## Phase 5 ✅: Backend-Aware GPU Resources

Keep logical renderer handles stable while allowing each backend to own native
objects.

- Store WebGL2 objects and WebGPU objects as backend-specific fields behind the
  same texture, sampler, and buffer records.
- Replace WebGL2-only upload/resolve calls with backend-dispatched methods or
  submitter-specific adapters.
- Preserve retained texture uploads, fallback texture resolution, transient
  buffers, and resource release semantics.
- Add WebGPU-ready descriptors for textures, samplers, uniform/storage buffers,
  and transient frame buffers.
- Test retained upload replay, fallback texture behavior, transient cleanup,
  and invalidation across backend loss.

## Phase 6 ✅: WebGPU Device And Surface Foundation

Acquire and manage the WebGPU device and canvas context without drawing first.

- Request adapter and device from `navigator.gpu`.
- Configure the WebGPU canvas context using target size and DPR.
- Track `device.lost` and mark renderer graphics state lost when it resolves.
- Surface WebGPU capabilities through the same read-only render diagnostics.
- Keep all WebGPU handles private to `gfxBackend`, resource, pipeline, and
  submitter internals.

## Phase 7: First WebGPU 2D Submission

Implement the first real WebGPU submit path for existing prepared 2D batches.

- Support solid and textured 2D batch families with current prepared-frame data.
- Compile/cache WGSL pipelines from portable descriptors.
- Upload per-frame vertex data through WebGPU buffers.
- Bind textures, samplers, and fallback resources through WebGPU bind groups.
- Match existing WebGL2 submit metrics: draw calls, vertices, skipped resources,
  fallback resources, and submitted/skipped results.

## Phase 8: Loss Recovery And Parity Tests

Harden lifecycle behavior so WebGL2 and WebGPU recover through the same logical
resource model.

- On backend loss, invalidate native resources and compiled pipelines.
- Preserve logical resource registrations and retained uploads.
- Recreate native backend objects after recovery where the platform allows it.
- Keep `RenderService.stop()` and `dispose()` behavior deterministic.
- Add parity tests for lifecycle, fallback, pipeline invalidation, upload replay,
  and submit metrics across WebGL2 and WebGPU paths.

## Non-Goals For This Stage

- Do not expose backend handles through `GameCtx`, authored systems, or
  `RenderFrameInput`.
- Do not redesign render extraction or world storage.
- Do not add text rendering, font atlases, or glyph resources.
- Do not start the hot-path typed-arena/permanent-buffer rewrite beyond small
  changes needed to avoid blocking backend abstraction.
