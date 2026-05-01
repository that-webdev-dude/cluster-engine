export type WorldManagerTodoStatus = "deferred";

export type WorldManagerTodo = Readonly<{
    status: WorldManagerTodoStatus;
    title: string;
    summary: string;
    implementationNotes: readonly string[];
}>;

export const WORLD_MANAGER_TODO: readonly WorldManagerTodo[] = Object.freeze([
    {
        status: "deferred",
        title: "Add typed numeric columns",
        summary:
            "World storage currently uses regular arrays for V1 simplicity and string support.",
        implementationNotes: Object.freeze([
            "Keep the public query and snapshot contracts unchanged.",
            "Introduce typed arrays only behind Storage/Chunk internals.",
            "Preserve string fields in regular arrays or a parallel string-column path.",
        ]),
    },
    {
        status: "deferred",
        title: "Optimize query execution",
        summary:
            "The first query API is store-scoped and correct, but not a generated hot-path iterator.",
        implementationNotes: Object.freeze([
            "Cache archetype matches per component-set query when profiling shows pressure.",
            "Consider generated accessors or direct column views without exposing Storage or Chunk classes.",
            "Keep mutation limited to existing primitive fields.",
        ]),
    },
    {
        status: "deferred",
        title: "Add presentation-specific publication",
        summary:
            "The first published snapshot is a debug/inspection snapshot, not a render-facing shape.",
        implementationNotes: Object.freeze([
            "Build presentation projections in a lower-level presentation service or dedicated publisher.",
            "Do not make game orchestration depend on presentation-shaped world snapshots.",
            "Keep debug snapshots stable and inspection-friendly.",
        ]),
    },
    {
        status: "deferred",
        title: "Add authoring context helpers",
        summary:
            "WorldManager is store-scoped; scene-to-store binding belongs above the runtime manager.",
        implementationNotes: Object.freeze([
            "Create helpers that bind a scene instance id or other owner id to a world storeId.",
            "Keep scene-specific names out of WorldStorage.module.",
            "Expose ergonomic author-facing spawn/query helpers outside the storage core.",
        ]),
    },
]);

