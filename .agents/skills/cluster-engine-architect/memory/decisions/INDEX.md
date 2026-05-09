# Decision Index

Load this index before opening individual decision records. Keep entries short.

| ID | Title | Area | Status | Summary |
| --- | --- | --- | --- | --- |
| 0001 | Loop Service Reports Timing Frames | runtime | Accepted | LoopService owns clock/timing mechanics and reports timing frames; GameFramePipeline owns engine phase sequencing. |
| 0002 | Author Systems Use Input And Update Phases | authoring/runtime | Accepted | Author-facing systems expose only input and update; fixed-step timing remains internal, and render preparation moves to a read-only pipeline boundary. |
| 0003 | Renderer Receives Render Frame Input | renderer/runtime/api | Accepted | Render receives renderer-owned RenderFrameInput, owns prepare and execute, and stays decoupled from world, scene, entity, query, and manager shapes. |
