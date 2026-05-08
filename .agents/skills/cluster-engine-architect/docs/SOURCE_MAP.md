# Source Map

Use this map to inspect the right code before planning changes.

| Concern | Primary paths |
| --- | --- |
| Game orchestration | `src/cluster/engine/game/service/` |
| Authored scene adaptation | `src/cluster/engine/game/modules/AuthoredSceneAdapter.module.ts` |
| Frame pipeline | `src/cluster/engine/game/modules/GameFramePipeline.module.ts` |
| Authoring helpers | `src/cluster/engine/game/authoring/` |
| Scene ownership and scheduling | `src/cluster/engine/managers/scene/` |
| World storage and queries | `src/cluster/engine/managers/world/` |
| Display service | `src/cluster/engine/services/display/` |
| Input service | `src/cluster/engine/services/input/` |
| Loop service | `src/cluster/engine/services/loop/` |
| Lifecycle controller | `src/cluster/engine/controllers/Lifecycle.controller.ts` |
| System contracts | `src/cluster/engine/systems/` |
| Shared engine types | `src/cluster/engine/types/` |

Prefer `rg` and package indexes to trace public boundaries before opening many
files.
