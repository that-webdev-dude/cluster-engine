import { describe, expect, it } from "vitest";
import { createSceneManager } from "./SceneManager.service";
import type { Scene, ScenePolicy } from "../Scene.types";
import type { System } from "../../../systems";
import type { SceneExecPass } from "./SceneManager.types";

type TestCtx = { log: string[] };
type TestRun = number;

function createTestSystem(
    id: string,
    phase: SceneExecPass = "update",
): System<TestCtx, TestRun> {
    return {
        id,
        phase,
        execute(ctx, run) {
            ctx.log.push(`${id}:${run}`);
        },
        order: 0,
        group: "default",
        groupOrder: 0,
    };
}

function createTestScene(
    config: {
        instanceId?: string;
        policy?: ScenePolicy;
        systems?: readonly System<TestCtx, TestRun>[];
        onCleanup?: () => void;
    } = {},
): Scene<TestCtx, TestRun> {
    const {
        instanceId,
        policy,
        systems = [createTestSystem("demo.modal.update")],
        onCleanup,
    } = config;

    return {
        id: "demo.modal",
        instanceId,
        policy,
        onMount(ctx) {
            ctx.addSystems(...systems);
            return onCleanup;
        },
    };
}

function createSceneWithPassSystem(
    instanceId: string,
    phase: SceneExecPass,
    policy?: ScenePolicy,
): Scene<TestCtx, TestRun> {
    return createTestScene({
        instanceId,
        policy,
        systems: [createTestSystem(`${instanceId}.${phase}`, phase)],
    });
}

describe("createSceneManager", () => {
    it("allows distinct instances of the same scene definition", async () => {
        const manager = createSceneManager<TestCtx, TestRun>();

        await manager.start();
        manager.commands.request.push(
            createTestScene({ instanceId: "demo.modal#1" }),
        );
        manager.commands.request.push(
            createTestScene({ instanceId: "demo.modal#2" }),
        );
        manager.flush();

        expect(manager.view.stack.instanceIds).toEqual([
            "demo.modal#1",
            "demo.modal#2",
        ]);
        expect(manager.view.update.instanceIds).toEqual([
            "demo.modal#1",
            "demo.modal#2",
        ]);
    });

    it("keeps singleton-by-definition behavior for the default scene instance", async () => {
        let cleanupCount = 0;
        const manager = createSceneManager<TestCtx, TestRun>();

        await manager.start();
        manager.commands.request.push(
            createTestScene({
                onCleanup: () => {
                    cleanupCount += 1;
                },
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

    it("executes systems registered during scene mount for the matching pass", async () => {
        const manager = createSceneManager<TestCtx, TestRun>();
        const ctx: TestCtx = { log: [] };

        await manager.start();
        manager.commands.request.push(
            createSceneWithPassSystem("demo.scene", "update"),
        );
        manager.flush();

        manager.execute({ pass: "update", ctx, run: 16 });

        expect(ctx.log).toEqual(["demo.scene.update:16"]);
    });

    it("executes systems with contexts scoped by scene instance id", async () => {
        const manager = createSceneManager<TestCtx, TestRun>();
        const log: string[] = [];

        await manager.start();
        manager.commands.request.push(
            createSceneWithPassSystem("bottom", "update"),
        );
        manager.commands.request.push(
            createSceneWithPassSystem("top", "update"),
        );
        manager.flush();

        manager.scopedExecute({
            pass: "update",
            run: 16,
            scope(scopeId) {
                const ctx = { log };
                ctx.log.push(`scope:${scopeId}`);
                return ctx;
            },
        });

        expect(log).toEqual([
            "scope:bottom",
            "bottom.update:16",
            "scope:top",
            "top.update:16",
        ]);
    });

    it("does not execute queued scenes before flush", async () => {
        const manager = createSceneManager<TestCtx, TestRun>();
        const ctx: TestCtx = { log: [] };

        await manager.start();
        manager.commands.request.push(
            createSceneWithPassSystem("demo.scene", "update"),
        );

        manager.execute({ pass: "update", ctx, run: 16 });

        expect(ctx.log).toEqual([]);
    });

    it("executes input from top to bottom", async () => {
        const manager = createSceneManager<TestCtx, TestRun>();
        const ctx: TestCtx = { log: [] };

        await manager.start();
        manager.commands.request.push(
            createSceneWithPassSystem("bottom", "input"),
        );
        manager.commands.request.push(
            createSceneWithPassSystem("top", "input"),
        );
        manager.flush();

        manager.execute({ pass: "input", ctx, run: 1 });

        expect(ctx.log).toEqual(["top.input:1", "bottom.input:1"]);
    });

    it("executes update from bottom to top", async () => {
        const manager = createSceneManager<TestCtx, TestRun>();
        const ctx: TestCtx = { log: [] };

        await manager.start();
        manager.commands.request.push(
            createSceneWithPassSystem("bottom", "update"),
        );
        manager.commands.request.push(
            createSceneWithPassSystem("top", "update"),
        );
        manager.flush();

        manager.execute({ pass: "update", ctx, run: 2 });

        expect(ctx.log).toEqual(["bottom.update:2", "top.update:2"]);
    });

    it("honors capturesInput by excluding scenes below the topmost capture", async () => {
        const manager = createSceneManager<TestCtx, TestRun>();
        const ctx: TestCtx = { log: [] };

        await manager.start();
        manager.commands.request.push(
            createSceneWithPassSystem("base", "input"),
        );
        manager.commands.request.push(
            createSceneWithPassSystem("menu", "input", {
                capturesInput: true,
            }),
        );
        manager.commands.request.push(
            createSceneWithPassSystem("tooltip", "input"),
        );
        manager.flush();

        manager.execute({ pass: "input", ctx, run: 1 });

        expect(ctx.log).toEqual(["tooltip.input:1", "menu.input:1"]);
    });

    it("honors blocksUpdateBelow for update", async () => {
        const manager = createSceneManager<TestCtx, TestRun>();
        const ctx: TestCtx = { log: [] };

        await manager.start();
        manager.commands.request.push(
            createTestScene({
                instanceId: "base",
                systems: [createTestSystem("base.update", "update")],
            }),
        );
        manager.commands.request.push(
            createTestScene({
                instanceId: "menu",
                policy: { blocksUpdateBelow: true },
                systems: [createTestSystem("menu.update", "update")],
            }),
        );
        manager.commands.request.push(
            createTestScene({
                instanceId: "tooltip",
                systems: [createTestSystem("tooltip.update", "update")],
            }),
        );
        manager.flush();

        manager.execute({ pass: "update", ctx, run: 2 });

        expect(ctx.log).toEqual(["menu.update:2", "tooltip.update:2"]);
    });

    it("does nothing after stop without throwing", async () => {
        const manager = createSceneManager<TestCtx, TestRun>();
        const ctx: TestCtx = { log: [] };

        await manager.start();
        manager.commands.request.push(
            createSceneWithPassSystem("demo.scene", "update"),
        );
        manager.flush();
        await manager.stop();

        expect(() =>
            manager.execute({ pass: "update", ctx, run: 16 }),
        ).not.toThrow();
        expect(ctx.log).toEqual([]);
    });

    it("throws after dispose in debug mode", async () => {
        const manager = createSceneManager<TestCtx, TestRun>({
            debug: true,
        });
        const ctx: TestCtx = { log: [] };

        await manager.start();
        await manager.dispose();

        expect(() =>
            manager.execute({ pass: "update", ctx, run: 16 }),
        ).toThrow("SceneManager.assertNotDisposed: called after dispose()");
    });
});
