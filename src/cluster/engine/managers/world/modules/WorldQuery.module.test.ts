import { describe, expect, it } from "vitest";
import { parseEntity, validateArchetypeFields } from "./WorldEntitySchema.module";
import { createWorldQueryRows } from "./WorldQuery.module";
import { createWorldStoreIndex } from "./WorldStoreIndex.module";
import type { Entity } from "../entity";
import type { ComponentConfigMap, ComponentSchema } from "../storage/types/component";

describe("createWorldQueryRows", () => {
    it("returns empty rows for empty component requests", () => {
        const index = createWorldStoreIndex();

        expect(
            createWorldQueryRows(
                "store.a",
                index.get("store.a"),
                [],
                index.findEntityIdAtRow,
            ),
        ).toEqual([]);
    });

    it("normalizes duplicate component names and exposes live field accessors", () => {
        const index = createWorldStoreIndex();
        spawn(index, "store.a", {
            id: "moving",
            position: { x: 0, y: 0 },
            velocity: { x: 1, y: 1 },
        });
        spawn(index, "store.a", {
            id: "still",
            position: { x: 5, y: 5 },
        });

        const rows = createWorldQueryRows(
            "store.a",
            index.get("store.a"),
            ["velocity", "position", "velocity"],
            index.findEntityIdAtRow,
        );

        expect(rows).toHaveLength(1);
        expect(rows[0].entityId).toBe("moving");
        expect(rows[0].components.position.x()).toBe(0);

        rows[0].components.position.x(10);

        const updated = createWorldQueryRows(
            "store.a",
            index.get("store.a"),
            ["position"],
            index.findEntityIdAtRow,
        );
        expect(updated[0].components.position.x()).toBe(10);
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
