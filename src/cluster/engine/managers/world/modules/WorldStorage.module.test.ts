import { describe, expect, it } from "vitest";
import { createWorldStorageModule } from "./WorldStorage.module";

describe("createWorldStorageModule", () => {
    it("spawns entities into stores and tracks counts", () => {
        const storage = createWorldStorageModule();

        const record = storage.spawn("store.a", {
            id: "player",
            position: { x: 10, y: 20 },
        });

        expect(record).toMatchObject({
            entityId: "player",
            storeId: "store.a",
            archetypeId: "position",
            chunkId: 0,
            row: 0,
            generation: 0,
        });
        expect(storage.getStoreIds()).toEqual(["store.a"]);
        expect(storage.getStoreCount()).toBe(1);
        expect(storage.getEntityCount()).toBe(1);
        expect(storage.getEntityCount("store.a")).toBe(1);
    });

    it("uses the same archetype id for matching component sets", () => {
        const storage = createWorldStorageModule();

        const first = storage.spawn("store.a", {
            id: "a",
            position: { x: 0, y: 0 },
            sprite: { key: "player" },
        });
        const second = storage.spawn("store.a", {
            id: "b",
            sprite: { key: "enemy" },
            position: { x: 1, y: 2 },
        });

        expect(first.archetypeId).toBe("position|sprite");
        expect(second.archetypeId).toBe(first.archetypeId);
        expect(second.row).toBe(1);
        expect(storage.getStoreCount()).toBe(1);
        expect(storage.getEntityCount("store.a")).toBe(2);
    });

    it("keeps different component sets and stores isolated", () => {
        const storage = createWorldStorageModule();

        const positioned = storage.spawn("store.a", {
            id: "positioned",
            position: { x: 0, y: 0 },
        });
        const moving = storage.spawn("store.a", {
            id: "moving",
            position: { x: 1, y: 2 },
            velocity: { x: 3, y: 4 },
        });
        const otherStore = storage.spawn("store.b", {
            id: "positioned",
            position: { x: 5, y: 6 },
        });

        expect(positioned.archetypeId).toBe("position");
        expect(moving.archetypeId).toBe("position|velocity");
        expect(otherStore.archetypeId).toBe("position");
        expect(storage.getStoreCount()).toBe(2);
        expect(storage.getEntityCount("store.a")).toBe(2);
        expect(storage.getEntityCount("store.b")).toBe(1);
    });

    it("updates moved-row metadata when deleting from a compacted chunk", () => {
        const storage = createWorldStorageModule();

        storage.spawn("store.a", {
            id: "a",
            position: { x: 0, y: 0 },
        });
        storage.spawn("store.a", {
            id: "b",
            position: { x: 1, y: 1 },
        });
        storage.spawn("store.a", {
            id: "c",
            position: { x: 2, y: 2 },
        });

        const result = storage.destroy("store.a", "a");

        expect(result.destroyed).toBe(true);
        expect(result.moved).toMatchObject({
            entityId: "c",
            storeId: "store.a",
            archetypeId: "position",
            chunkId: 0,
            row: 0,
            generation: 0,
        });
        expect(storage.getEntityCount("store.a")).toBe(2);

        const movedDelete = storage.destroy("store.a", "c");
        expect(movedDelete.destroyed).toBe(true);
        expect(storage.getEntityCount("store.a")).toBe(1);
    });

    it("clears a single store without clearing other stores", () => {
        const storage = createWorldStorageModule();

        storage.spawn("store.a", {
            id: "a",
            position: { x: 0, y: 0 },
        });
        storage.spawn("store.b", {
            id: "b",
            position: { x: 1, y: 1 },
        });

        expect(storage.clearStore("store.a")).toBe(true);

        expect(storage.getStoreIds()).toEqual(["store.b"]);
        expect(storage.getStoreCount()).toBe(1);
        expect(storage.getEntityCount()).toBe(1);
        expect(storage.clearStore("store.a")).toBe(false);
    });

    it("clears all stores", () => {
        const storage = createWorldStorageModule();

        storage.spawn("store.a", {
            id: "a",
            position: { x: 0, y: 0 },
        });
        storage.spawn("store.b", {
            id: "b",
            position: { x: 1, y: 1 },
        });

        storage.clear();

        expect(storage.getStoreIds()).toEqual([]);
        expect(storage.getStoreCount()).toBe(0);
        expect(storage.getEntityCount()).toBe(0);
    });

    it("rejects invalid entities and duplicate ids", () => {
        const storage = createWorldStorageModule();

        expect(() =>
            storage.spawn("store.a", {
                id: "",
                position: { x: 0, y: 0 },
            }),
        ).toThrow("entityId must be a non-empty string");
        expect(() =>
            storage.spawn("store.a", {
                id: "array-component",
                position: [0, 0],
            }),
        ).toThrow("must be a plain object");
        expect(() =>
            storage.spawn("store.a", {
                id: "nested",
                position: { value: { x: 0 } },
            }),
        ).toThrow("must be a finite number or string");

        storage.spawn("store.a", {
            id: "dupe",
            position: { x: 0, y: 0 },
        });

        expect(() =>
            storage.spawn("store.a", {
                id: "dupe",
                position: { x: 1, y: 1 },
            }),
        ).toThrow("duplicate entity id dupe");
    });

    it("rejects field drift within an existing store archetype", () => {
        const storage = createWorldStorageModule();

        storage.spawn("store.a", {
            id: "first",
            position: { x: 0, y: 0 },
        });

        expect(() =>
            storage.spawn("store.a", {
                id: "second",
                position: { x: 1, z: 1 },
            }),
        ).toThrow("fields do not match archetype position");
    });
});
