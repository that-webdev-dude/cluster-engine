import { describe, expect, it } from "vitest";
import { createWorldManager } from "./WorldManager.service";

describe("createWorldManager", () => {
    it("does not apply queued commands before flush", async () => {
        const manager = createWorldManager();

        await manager.start();
        manager.commands.request.spawn("store.a", {
            id: "player",
            position: { x: 0, y: 0 },
        });

        manager.publish();

        expect(manager.view.storeCount).toBe(0);
        expect(manager.view.entityCount).toBe(0);
        expect(manager.view.rev).toBe(0);
        expect(manager.view.changed).toBe(false);
    });

    it("applies queued spawn and destroy commands during flush", async () => {
        const manager = createWorldManager();

        await manager.start();
        manager.commands.request.spawn("store.a", {
            id: "player",
            position: { x: 0, y: 0 },
        });
        manager.flush();
        manager.publish();

        expect(manager.view.storeCount).toBe(1);
        expect(manager.view.entityCount).toBe(1);
        expect(manager.view.rev).toBe(1);
        expect(manager.view.changed).toBe(true);

        manager.commands.request.destroy("store.a", "player");
        manager.flush();
        manager.publish();

        expect(manager.view.storeCount).toBe(0);
        expect(manager.view.entityCount).toBe(0);
        expect(manager.view.rev).toBe(2);
        expect(manager.view.changed).toBe(true);
    });

    it("marks publish unchanged when storage metadata is stable", async () => {
        const manager = createWorldManager();

        await manager.start();
        manager.commands.request.spawn("store.a", {
            id: "player",
            position: { x: 0, y: 0 },
        });
        manager.flush();
        manager.publish();

        const rev = manager.view.rev;
        manager.publish();

        expect(manager.view.rev).toBe(rev);
        expect(manager.view.changed).toBe(false);
    });

    it("clears queued commands and storage on dispose", async () => {
        const manager = createWorldManager();

        await manager.start();
        manager.commands.request.spawn("store.a", {
            id: "player",
            position: { x: 0, y: 0 },
        });
        manager.flush();
        manager.publish();

        expect(manager.view.storeCount).toBe(1);

        await manager.dispose();

        expect(manager.view.storeCount).toBe(0);
        expect(manager.view.entityCount).toBe(0);
    });

    it("applies queued clear during flush", async () => {
        const manager = createWorldManager();

        await manager.start();
        manager.commands.request.spawn("store.a", {
            id: "player",
            position: { x: 0, y: 0 },
        });
        manager.flush();
        manager.publish();

        manager.commands.request.clear();
        manager.publish();

        expect(manager.view.storeCount).toBe(1);
        expect(manager.view.entityCount).toBe(1);

        manager.flush();
        manager.publish();

        expect(manager.view.storeCount).toBe(0);
        expect(manager.view.entityCount).toBe(0);
    });

    it("applies queued store clear during flush", async () => {
        const manager = createWorldManager();

        await manager.start();
        manager.commands.request.spawn("store.a", {
            id: "a",
            position: { x: 0, y: 0 },
        });
        manager.commands.request.spawn("store.b", {
            id: "b",
            position: { x: 1, y: 1 },
        });
        manager.flush();
        manager.publish();

        manager.commands.request.clearStore("store.a");
        manager.publish();

        expect(manager.view.storeCount).toBe(2);
        expect(manager.view.entityCount).toBe(2);

        manager.flush();
        manager.publish();

        expect(manager.view.storeCount).toBe(1);
        expect(manager.view.entityCount).toBe(1);
        expect(manager.view.debug.stores[0].storeId).toBe("store.b");
    });

    it("applies queued spawn clear spawn in order", async () => {
        const manager = createWorldManager();

        await manager.start();
        manager.commands.request.spawn("store.a", {
            id: "first",
            position: { x: 0, y: 0 },
        });
        manager.commands.request.clear();
        manager.commands.request.spawn("store.a", {
            id: "second",
            position: { x: 1, y: 1 },
        });
        manager.flush();
        manager.publish();

        const entity =
            manager.view.debug.stores[0].archetypes[0].entities[0];
        expect(manager.view.entityCount).toBe(1);
        expect(entity.entityId).toBe("second");
    });

    it("queries store-scoped component rows and allows field mutation", async () => {
        const manager = createWorldManager();

        await manager.start();
        manager.commands.request.spawn("store.a", {
            id: "moving",
            position: { x: 0, y: 0 },
            velocity: { x: 1, y: 1 },
        });
        manager.commands.request.spawn("store.a", {
            id: "still",
            position: { x: 5, y: 5 },
        });
        manager.commands.request.spawn("store.b", {
            id: "other",
            position: { x: 9, y: 9 },
            velocity: { x: 2, y: 2 },
        });
        manager.flush();

        const rows = manager.query("store.a", ["position", "velocity"]);

        expect(rows).toHaveLength(1);
        expect(rows[0].entityId).toBe("moving");
        rows[0].components.position.x.write(42);

        const [updated] = manager.query("store.a", ["position"]);
        expect(updated.components.position.x.read()).toBe(42);
    });

    it("publishes copied debug snapshots", async () => {
        const manager = createWorldManager();

        await manager.start();
        manager.commands.request.spawn("store.a", {
            id: "player",
            position: { x: 0, y: 0 },
        });
        manager.flush();
        manager.publish();

        const before = manager.view.debug;
        const rev = manager.view.rev;
        const [row] = manager.query("store.a", ["position"]);
        row.components.position.x.write(10);

        expect(
            before.stores[0].archetypes[0].entities[0].components.position.x,
        ).toBe(0);

        manager.publish();

        expect(manager.view.rev).toBe(rev + 1);
        expect(
            manager.view.debug.stores[0].archetypes[0].entities[0].components
                .position.x,
        ).toBe(10);
    });

    it("does not flush or publish while stopped, but preserves live storage", async () => {
        const manager = createWorldManager();

        await manager.start();
        manager.commands.request.spawn("store.a", {
            id: "player",
            position: { x: 0, y: 0 },
        });
        manager.flush();
        manager.publish();
        await manager.stop();

        manager.commands.request.spawn("store.a", {
            id: "queued",
            position: { x: 1, y: 1 },
        });
        manager.flush();
        manager.publish();

        expect(manager.view.entityCount).toBe(1);

        await manager.start();
        manager.flush();
        manager.publish();

        expect(manager.view.entityCount).toBe(2);
    });

    it("throws after dispose in debug mode", async () => {
        const manager = createWorldManager({ debug: true });

        await manager.start();
        await manager.dispose();

        expect(() => manager.flush()).toThrow(
            "WorldService: called after dispose()",
        );
        expect(() => manager.publish()).toThrow(
            "WorldService: called after dispose()",
        );
        expect(() => manager.query("store.a", ["position"])).toThrow(
            "WorldService: called after dispose()",
        );
    });

    it("throws on missing destroy in debug mode", async () => {
        const manager = createWorldManager({ debug: true });

        await manager.start();
        manager.commands.request.destroy("store.a", "missing");

        expect(() => manager.flush()).toThrow(
            "entity missing not found in store store.a",
        );
    });
});
