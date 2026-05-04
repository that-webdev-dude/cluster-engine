import { describe, expect, it } from "vitest";
import { createWorldDebugSnapshot } from "./WorldDebugSnapshot.module";
import { parseEntity, validateArchetypeFields } from "./WorldEntitySchema.module";
import { createWorldStoreIndex } from "./WorldStoreIndex.module";
import type { Entity } from "../entity";
import type { ComponentConfigMap, ComponentSchema } from "../storage/types/component";

describe("createWorldDebugSnapshot", () => {
    it("creates copied, frozen, sorted debug snapshots", () => {
        const index = createWorldStoreIndex();
        spawn(index, "store.b", {
            id: "b",
            position: { y: 2, x: 1 },
        });
        spawn(index, "store.a", {
            id: "a",
            position: { x: 0, y: 0 },
        });

        const before = createWorldDebugSnapshot(
            index.entries(),
            index.findEntityIdAtRow,
        );
        const store = index.get("store.a");
        const row = store?.archetypes
            .get("position")
            ?.[Symbol.iterator]()
            .next().value;
        row?.components.position.x(0, 99);
        const after = createWorldDebugSnapshot(
            index.entries(),
            index.findEntityIdAtRow,
        );

        expect(Object.isFrozen(before)).toBe(true);
        expect(before.stores.map((snapshot) => snapshot.storeId)).toEqual([
            "store.a",
            "store.b",
        ]);
        expect(before.stores[0].archetypes[0].entities[0].components.position.x)
            .toBe(0);
        expect(after.stores[0].archetypes[0].entities[0].components.position.x)
            .toBe(99);
        expect(Object.keys(before.stores[0].archetypes[0].entities[0].components.position)).toEqual([
            "x",
            "y",
        ]);
    });
});

function spawn(
    index: ReturnType<typeof createWorldStoreIndex>,
    storeId: string,
    entity: Entity,
): void {
    const parsed = parseEntity(entity);
    const store = index.getOrCreate(storeId);
    const storage = index.getOrCreateArchetypeStorage(store, parsed);
    validateArchetypeFields(storage.archetype, parsed);
    const meta = storage.allocate(
        parsed.components as ComponentConfigMap<ComponentSchema>,
    );
    store.entities.set(
        parsed.entityId,
        index.createEntityRecord(storeId, parsed.entityId, meta),
    );
}
