import { describe, expect, it } from "vitest";
import { createSceneManager } from "./SceneManager.service";
import type { Scene } from "../Scene.types";
import type { System } from "../../../types/system";

type TestPhase = "fixedUpdate";
type TestCtx = {};
type TestRun = number;

function createTestSystem(id: string): System<TestPhase, TestCtx, TestRun> {
    return {
        id,
        phase: "fixedUpdate",
        execute() {},
        order: 0,
        group: "default",
        groupOrder: 0,
    };
}

function createTestScene(
    instanceId?: string,
    onCleanup?: () => void,
): Scene<TestPhase, TestCtx, TestRun> {
    return {
        id: "demo.modal",
        instanceId,
        onMount(ctx) {
            ctx.add(createTestSystem("demo.modal.fixedUpdate"));
            return onCleanup;
        },
    };
}

describe("createSceneManager", () => {
    it("allows distinct instances of the same scene definition", async () => {
        const manager = createSceneManager<TestPhase, TestCtx, TestRun>();

        await manager.start();
        manager.commands.request.push(createTestScene("demo.modal#1"));
        manager.commands.request.push(createTestScene("demo.modal#2"));
        manager.flush();

        expect(manager.view.stack.instanceIds).toEqual([
            "demo.modal#1",
            "demo.modal#2",
        ]);
        expect(manager.view.fixedUpdate.instanceIds).toEqual([
            "demo.modal#1",
            "demo.modal#2",
        ]);
        expect(manager.view.preRender.instanceIds).toEqual([
            "demo.modal#1",
            "demo.modal#2",
        ]);
    });

    it("keeps singleton-by-definition behavior for the default scene instance", async () => {
        let cleanupCount = 0;
        const manager = createSceneManager<TestPhase, TestCtx, TestRun>();

        await manager.start();
        manager.commands.request.push(
            createTestScene(undefined, () => {
                cleanupCount += 1;
            }),
        );
        manager.commands.request.push(createTestScene());
        manager.flush();

        expect(manager.view.stack.instanceIds).toEqual(["demo.modal"]);

        manager.commands.request.pop();
        manager.flush();

        expect(manager.view.stack.instanceIds).toEqual([]);
        expect(cleanupCount).toBe(1);
    });
});
