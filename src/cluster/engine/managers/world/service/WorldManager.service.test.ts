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
        expect(manager.view.rev).toBe(1);
        expect(manager.view.changed).toBe(true);

        manager.commands.request.destroy("store.a", "player");
        manager.flush();
        manager.publish();

        expect(manager.view.storeCount).toBe(0);
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
    });
});
