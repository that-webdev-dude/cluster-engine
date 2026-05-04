import { describe, expect, it } from "vitest";
import { createAuthoredSceneAdapter } from "./AuthoredSceneAdapter.module";
import type { GameSystem } from "../service/Game.types";

const testSystem: GameSystem = {
    id: "test.system",
    phase: "fixedUpdate",
    order: 0,
    group: "main",
    groupOrder: 0,
    execute() {},
};

describe("createAuthoredSceneAdapter", () => {
    it("queues scene store cleanup after authored cleanup on unmount", () => {
        const log: string[] = [];
        const adapter = createAuthoredSceneAdapter({
            spawnEntity(storeId, entity) {
                log.push(`spawn:${storeId}:${entity.id}`);
            },
            clearStore(storeId) {
                log.push(`clearStore:${storeId}`);
            },
        });

        const runtimeScene = adapter.toRuntimeScene({
            id: "level.one",
            instanceId: "level.one#1",
            setup(ctx) {
                ctx.addEntities({
                    id: "player",
                    position: { x: 0, y: 0 },
                });
                ctx.addSystems(testSystem);

                return () => {
                    log.push("authoredCleanup");
                };
            },
        });

        const systems: GameSystem[] = [];
        const cleanup = runtimeScene.onMount?.({
            addSystems(...registeredSystems) {
                systems.push(...registeredSystems);
            },
        });

        expect(systems).toEqual([testSystem]);
        expect(log).toEqual(["spawn:level.one#1:player"]);

        cleanup?.();

        expect(log).toEqual([
            "spawn:level.one#1:player",
            "authoredCleanup",
            "clearStore:level.one#1",
        ]);
    });

    it("clears the authored scene id store when instance id is omitted", () => {
        const clearedStores: string[] = [];
        const adapter = createAuthoredSceneAdapter({
            spawnEntity() {},
            clearStore(storeId) {
                clearedStores.push(storeId);
            },
        });

        const runtimeScene = adapter.toRuntimeScene({
            id: "singleton.scene",
            setup() {},
        });

        runtimeScene.onMount?.({
            addSystems() {},
        })?.();

        expect(clearedStores).toEqual(["singleton.scene"]);
    });

    it("still queues scene store cleanup when authored cleanup throws", () => {
        const clearedStores: string[] = [];
        const adapter = createAuthoredSceneAdapter({
            spawnEntity() {},
            clearStore(storeId) {
                clearedStores.push(storeId);
            },
        });

        const runtimeScene = adapter.toRuntimeScene({
            id: "throwing.scene",
            setup() {
                return () => {
                    throw new Error("cleanup failed");
                };
            },
        });

        const cleanup = runtimeScene.onMount?.({
            addSystems() {},
        });

        expect(() => cleanup?.()).toThrow("cleanup failed");
        expect(clearedStores).toEqual(["throwing.scene"]);
    });
});
