import { describe, expect, it } from "vitest";
import { parseEntity, validateArchetypeFields } from "./WorldEntitySchema.module";
import { createWorldQueryRows } from "./WorldQuery.module";
import { createWorldStoreIndex } from "./WorldStoreIndex.module";
import type { Entity } from "../entity";
import type { ComponentConfigMap, ComponentSchema } from "../storage/types/component";
import type { WorldStore } from "./WorldStorage.types";
import type { Storage } from "../storage/storage";

describe("createWorldQueryRows", () => {
    it("returns empty rows for empty component requests", () => {
        const index = createWorldStoreIndex();

        expect(
            createWorldQueryRows(
                "store.a",
                index.get("store.a"),
                [],
                index.findEntityIdAtRow,
                index.isCurrentEntityRecord,
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
            index.isCurrentEntityRecord,
        );

        expect(rows).toHaveLength(1);
        expect(rows[0].entityId).toBe("moving");
        expect(rows[0].components.position.x.read()).toBe(0);

        rows[0].components.position.x.write(10);

        const updated = createWorldQueryRows(
            "store.a",
            index.get("store.a"),
            ["position"],
            index.findEntityIdAtRow,
            index.isCurrentEntityRecord,
        );
        expect(updated[0].components.position.x.read()).toBe(10);
    });

    it("rejects invalid field writes", () => {
        const index = createWorldStoreIndex();
        spawn(index, "store.a", {
            id: "moving",
            position: { x: 0, y: 0 },
        });

        const [row] = createWorldQueryRows(
            "store.a",
            index.get("store.a"),
            ["position"],
            index.findEntityIdAtRow,
            index.isCurrentEntityRecord,
        );

        expect(() => row.components.position.x.write(Number.NaN)).toThrow(
            "WorldQuery.write: value must be a finite number or string",
        );
        expect(() => row.components.position.x.write(Infinity)).toThrow(
            "WorldQuery.write: value must be a finite number or string",
        );
        expect(() =>
            row.components.position.x.write({} as never),
        ).toThrow("WorldQuery.write: value must be a finite number or string");
        expect(() =>
            row.components.position.x.write([] as never),
        ).toThrow("WorldQuery.write: value must be a finite number or string");
        expect(() =>
            row.components.position.x.write(undefined as never),
        ).toThrow("WorldQuery.write: value must be a finite number or string");
    });

    it("throws when reading a stale row after destroy", () => {
        const index = createWorldStoreIndex();
        const { store, storage } = spawn(index, "store.a", {
            id: "moving",
            position: { x: 0, y: 0 },
        });
        const [row] = createWorldQueryRows(
            "store.a",
            store,
            ["position"],
            index.findEntityIdAtRow,
            index.isCurrentEntityRecord,
        );

        const record = store.entities.get("moving");
        if (!record) throw new Error("missing test record");
        storage.delete(record.chunkId, record.row, record.generation);
        store.entities.delete("moving");

        expect(() => row.components.position.x.read()).toThrow(
            "WorldQuery: stale row for entity moving in store store.a",
        );
    });

    it("throws when writing a stale row after compaction moves the entity", () => {
        const index = createWorldStoreIndex();
        const { store, storage } = spawn(index, "store.a", {
            id: "a",
            position: { x: 0, y: 0 },
        });
        spawn(index, "store.a", {
            id: "b",
            position: { x: 1, y: 1 },
        });
        const rows = createWorldQueryRows(
            "store.a",
            store,
            ["position"],
            index.findEntityIdAtRow,
            index.isCurrentEntityRecord,
        );
        const staleB = rows.find((row) => row.entityId === "b");
        if (!staleB) throw new Error("missing stale row");

        const recordA = store.entities.get("a");
        const recordB = store.entities.get("b");
        if (!recordA || !recordB) throw new Error("missing test records");

        const result = storage.delete(
            recordA.chunkId,
            recordA.row,
            recordA.generation,
        );
        if (!result) throw new Error("delete failed");
        store.entities.delete("a");
        store.entities.set(
            "b",
            index.createEntityRecord("store.a", "b", result.meta),
        );

        expect(() => staleB.components.position.x.write(10)).toThrow(
            "WorldQuery: stale row for entity b in store store.a",
        );
    });
});

function spawn(
    index: ReturnType<typeof createWorldStoreIndex>,
    storeId: string,
    entity: Entity,
): {
    store: WorldStore;
    storage: Storage<ComponentSchema>;
} {
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
    return { store, storage };
}
