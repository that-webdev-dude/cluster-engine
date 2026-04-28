import { describe, expect, it } from "vitest";
import { createSceneManager } from "./SceneManager.service";
import type { Scene } from "../Scene.types";
import type { System } from "../../../types/system";

type TestPhase = "update";
type TestCtx = {};
type TestRun = number;

function createTestSystem(id: string): System<TestPhase, TestCtx, TestRun> {
    return {
        id,
        phase: "update",
        execute() {},
        order: 0,
        group: "default",
        groupOrder: 0,
    };
}

function createSchedulerSpy() {
    const registrations: string[] = [];
    const unregistrations: Array<string | undefined> = [];

    return {
        registrations,
        unregistrations,
        scheduler: {
            register(registration: {
                ownerId: string | number;
                system: System<TestPhase, TestCtx, TestRun>;
            }) {
                registrations.push(String(registration.ownerId));
            },
            unregister(ownerId?: string | number) {
                unregistrations.push(
                    ownerId === undefined ? undefined : String(ownerId),
                );
            },
        },
    };
}

function createTestScene(
    instanceId?: string,
): Scene<TestPhase, TestCtx, TestRun> {
    return {
        id: "demo.modal",
        instanceId,
        onMount(ctx) {
            ctx.add(createTestSystem("demo.modal.update"));
        },
    };
}

describe("createSceneManager", () => {
    it("allows distinct instances of the same scene definition", async () => {
        const schedulerSpy = createSchedulerSpy();
        const manager = createSceneManager<TestPhase, TestCtx, TestRun>();

        await manager.start();
        manager.commands.request.push(createTestScene("demo.modal#1"));
        manager.commands.request.push(createTestScene("demo.modal#2"));
        manager.flush();

        expect(manager.view.stack.instanceIds).toEqual([
            "demo.modal#1",
            "demo.modal#2",
        ]);
        expect(manager.view.update.instanceIds).toEqual([
            "demo.modal#1",
            "demo.modal#2",
        ]);
        expect(schedulerSpy.registrations).toEqual([
            "demo.modal#1",
            "demo.modal#2",
        ]);
    });

    it("keeps singleton-by-definition behavior for the default scene instance", async () => {
        const schedulerSpy = createSchedulerSpy();
        const manager = createSceneManager<TestPhase, TestCtx, TestRun>();

        await manager.start();
        manager.commands.push(createTestScene());
        manager.commands.request.push(createTestScene());
        manager.flush();

        expect(manager.view.stack.instanceIds).toEqual(["demo.modal"]);
        expect(schedulerSpy.registrations).toEqual(["demo.modal"]);

        manager.commands.pop();
        manager.flush();

        expect(manager.view.stack.instanceIds).toEqual([]);
        expect(schedulerSpy.unregistrations).toContain("demo.modal");
    });
});
