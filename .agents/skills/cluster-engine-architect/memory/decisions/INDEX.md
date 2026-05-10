# Decision Index

Load this index before opening individual decision records. Keep entries short.

| ID | Title | Area | Status | Summary |
| --- | --- | --- | --- | --- |
| 0001 | Loop Service Reports Timing Frames | runtime | Accepted | LoopService owns clock/timing mechanics and reports timing frames; GameFramePipeline owns engine phase sequencing. |
| 0002 | Author Systems Use Input And Update Phases | authoring/runtime | Accepted | Author-facing systems expose only input and update; fixed-step timing remains internal, and render preparation moves to a read-only pipeline boundary. |
| 0003 | Renderer Receives Render Frame Input | renderer/runtime/api | Accepted | Render receives renderer-owned RenderFrameInput, owns prepare and execute, and stays decoupled from world, scene, entity, query, and manager shapes. |
| 0004 | Render 2D Input And Interpolation Scope | renderer/runtime/api | Accepted | Initial 2D render input supports primitive items but defers text until font/glyph resources exist; render owns interpolation while previous-state capture belongs to extraction/frame boundaries. |
| 0005 | Render Extraction Adapter Is Transitional | renderer/world/runtime | Accepted | Phase 5 extraction may consume current world query rows, but this is only a bridge; future ECS storage can replace the adapter source without changing RenderFrameInput. |
| 0006 | Game Owns Render Service Wiring | renderer/runtime/api | Accepted | createGame owns render lifecycle and frame driving; GameConfig.prepareRender is removed instead of kept as a parallel render hook. |
| 0007 | Renderer Owns Backend Policy | renderer/runtime/api | Accepted | Backend selection is internal to render; public APIs do not choose WebGPU/WebGL2, and caps/native handles stay private. |
| 0008 | Render Pipeline Descriptors Are Portable | renderer/runtime/api | Accepted | Pipeline descriptors describe renderer intent; backend compilers select GLSL/WGSL privately, and descriptor types stay out of public render API. |
| 0009 | Render GPU Resources Are Backend-Aware | renderer/runtime/api | Accepted | Logical GPU resource handles stay backend-neutral; native WebGL2/WebGPU objects live only in private backend-specific gpuResource record state. |
| 0010 | WebGPU Surface Configures During Execute | renderer/runtime | Accepted | WebGPU surface configuration uses the last prepared target during RenderService.execute, keeping backend surface readiness in the render execution phase. |
| 0011 | Shared Private 2D Vertex Packing | renderer/runtime/api | Accepted | WebGL2 and WebGPU share private renderer-owned 2D vertex packing without changing RenderFrameInput, public exports, or game-owned extraction/driving. |
| 0012 | WebGPU Reusable Frame Vertex Buffers | renderer/performance | Accepted | WebGPU 2D submission reuses growable per-layout frame vertex buffers for first parity, deferring persistent/ring-buffer architecture to later performance work. |
