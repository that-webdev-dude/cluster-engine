export type WorldManagerTodoStatus = "missing" | "partial";

export type WorldManagerTodo = Readonly<{
    status: WorldManagerTodoStatus;
    title: string;
    summary: string;
    implementationNotes: readonly string[];
    acceptance: readonly string[];
}>;

export const WORLD_MANAGER_TODO: readonly WorldManagerTodo[] = Object.freeze([
    {
        status: "missing",
        title: "Expose queued clear command",
        summary:
            "The README defines clear() as part of the first command set, but WorldManager.commands.request currently exposes only spawn() and destroy().",
        implementationNotes: Object.freeze([
            "Add clear() to WorldCommandQueue.module as a queued command, not an immediate mutation.",
            "Add clear() to WorldManager.commands.request and WorldManager.types.",
            "During flush(), apply clear by clearing WorldStorage.module.",
            "Decide whether clearStore(storeId) should also be exposed later; the contract-complete minimum is global clear().",
        ]),
        acceptance: Object.freeze([
            "Calling commands.request.clear() before flush() leaves live storage unchanged.",
            "Calling flush() after clear removes all stores, entities, archetype storage, and indexes.",
            "Dispose still clears queued commands and live storage.",
        ]),
    },
    {
        status: "missing",
        title: "Add query access for systems",
        summary:
            "The manager does not yet expose read/write access for systems to iterate live component data during frame execution.",
        implementationNotes: Object.freeze([
            "Add a query module or WorldStorage query methods that resolve component-name sets to matching store/archetype chunks.",
            "Keep query access store-scoped: callers provide storeId or receive a scoped context already bound to one storeId.",
            "Do not expose Storage or Chunk classes through WorldManager; expose narrow query views or iterators.",
            "Allow component field value mutation through query results, but do not allow component add/remove operations.",
        ]),
        acceptance: Object.freeze([
            "A system can query entities with a component set in one store.",
            "Queries do not return entities from other stores.",
            "Systems can mutate existing primitive field values.",
            "There is still no addComponent/removeComponent API.",
        ]),
    },
    {
        status: "missing",
        title: "Publish stable world snapshots",
        summary:
            "publish() currently updates only rev/changed/storeCount metadata. It does not create a stable snapshot of world data.",
        implementationNotes: Object.freeze([
            "Add a Publisher module or snapshot builder behind WorldManager.publish().",
            "Create copied, read-only debug or inspection snapshots from WorldStorage.module data.",
            "Do not expose live component arrays or mutable storage internals.",
            "Keep presentation-specific transformation out of WorldManager unless a lower-level presentation service owns the target shape.",
        ]),
        acceptance: Object.freeze([
            "Downstream code can hold the published snapshot for the rest of the frame safely.",
            "Mutating live storage after publish does not mutate the previously published snapshot.",
            "view exposes snapshot metadata and any chosen debug/inspection snapshot without leaking live arrays.",
        ]),
    },
    {
        status: "partial",
        title: "Tighten entity input types",
        summary:
            "Runtime validation enforces primitive component fields, but Entity is still typed as an any-indexed object.",
        implementationNotes: Object.freeze([
            "Replace Entity's any index with a component-input shape based on number|string primitives.",
            "Keep id as the only reserved entity key.",
            "Preserve runtime validation because external callers can still pass invalid values.",
        ]),
        acceptance: Object.freeze([
            "TypeScript rejects nested objects, arrays, functions, and arbitrary component field values in normal usage.",
            "Runtime validation still rejects invalid untyped inputs.",
        ]),
    },
    {
        status: "partial",
        title: "Finalize duplicate and missing destroy policy",
        summary:
            "Duplicate spawns currently throw. Missing destroys return false inside WorldStorage.module, but WorldManager ignores the result.",
        implementationNotes: Object.freeze([
            "Document and test duplicate entity id behavior. Recommended default: always throw.",
            "Document and test missing destroy behavior. Recommended default: ignore in production, optionally throw in debug.",
            "Thread debug mode through WorldStorage.module instead of leaving the config unused.",
        ]),
        acceptance: Object.freeze([
            "Duplicate spawn behavior is covered by manager-level tests.",
            "Missing destroy behavior is covered by manager-level tests in debug and non-debug modes.",
            "WorldStorageConfig.debug is either used or removed.",
        ]),
    },
    {
        status: "missing",
        title: "Broaden manager lifecycle tests",
        summary:
            "Current tests cover basic flush, publish metadata, and dispose clearing, but not the full lifecycle contract.",
        implementationNotes: Object.freeze([
            "Add tests that stop() leaves live storage intact while flush() and publish() no-op.",
            "Add tests that restarting after stop allows flush() and publish() again.",
            "Add debug dispose rejection tests matching the lifecycle guard.",
            "Add clear command tests once clear() is exposed.",
        ]),
        acceptance: Object.freeze([
            "Lifecycle behavior is verified at the WorldManager boundary.",
            "Storage state preservation across stop/start is explicit.",
            "Disposed debug behavior is covered.",
        ]),
    },
    {
        status: "partial",
        title: "Keep storeId contract aligned in docs and APIs",
        summary:
            "The README now names storeId as the world ownership scope. Future manager work must preserve that boundary and avoid leaking scene concepts into storage.",
        implementationNotes: Object.freeze([
            "Keep WorldManager and WorldStorage APIs store-scoped.",
            "If scene systems use world storage, bind their scene instance id to a storeId in a higher-level context factory.",
            "Do not add clearScene(), getSceneCount(), sceneInstanceId, or scene-specific storage names to WorldStorage.module.",
        ]),
        acceptance: Object.freeze([
            "World storage APIs use storeId naming consistently.",
            "Scene ownership remains an orchestration or authoring-layer concern.",
        ]),
    },
]);

