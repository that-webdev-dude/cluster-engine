# API Stability

Use this guide to decide whether to preserve, evolve, or redesign an API.

## Stability Labels

- Stable: preserve unless the user explicitly asks for architectural change.
- Provisional: preserve for local fixes, but redesign is allowed during
  architectural work.
- Experimental: treat as a sketch and verify intent before building on it.

## Current Labels

| Area | Label | Notes |
| --- | --- | --- |
| Lifecycle methods (`start`, `stop`, `dispose`) | Stable | Shared service/manager contract. |
| Service and manager ownership boundaries | Stable | Preserve unless redesigning architecture. |
| Command-buffered structural mutation | Stable | Names may change; principle should remain. |
| Package `index.ts` boundaries | Stable | Prefer package imports for public use. |
| `GameCtx` shape | Provisional | May change with renderer, resources, queries, and world storage. |
| System phases | Provisional | Author-facing phases are currently `input` and `update`; render handoff is not final. |
| Entity authoring helper | Provisional | Must not dictate final world layout. |
| World query row API | Provisional | Likely to evolve for scale and data layout. |
| Renderer ownership | Experimental | Not designed yet. |
| Debug publication shape | Experimental | Must be scale-aware before being treated as stable. |

When changing provisional or experimental APIs, explain the migration cost and
the architecture property gained.
