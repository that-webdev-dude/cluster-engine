import { describe, expect, it } from "vitest";
import { createSceneManager } from "./SceneManager.service";
import type { Scene, ScenePolicy } from "../Scene.types";
import type { System } from "../../../types/system";
import type { SceneExecPass } from "./SceneManager.types";

type TestPhase = SceneExecPass;
type TestCtx = { log: string[] };
type TestRun = number;

function createTestSystem(
    id: string,
    phase: TestPhase = "fixedUpdate",
): System<TestPhase, TestCtx, TestRun> {
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
        systems?: readonly System<TestPhase, TestCtx, TestRun>[];
        onCleanup?: () => void;
    } = {},
): Scene<TestPhase, TestCtx, TestRun> {
    const {
        instanceId,
        policy,
        systems = [createTestSystem("demo.modal.fixedUpdate")],
        onCleanup,
    } = config;

    return {
        id: "demo.modal",
        instanceId,
        policy,
        onMount(ctx) {
            ctx.add(...systems);
            return onCleanup;
        },
    };
}

function createSceneWithPassSystem(
    instanceId: string,
    phase: TestPhase,
    policy?: ScenePolicy,
): Scene<TestPhase, TestCtx, TestRun> {
    return createTestScene({
        instanceId,
        policy,
        systems: [createTestSystem(`${instanceId}.${phase}`, phase)],
    });
}

describe("createSceneManager", () => {
    it("allows distinct instances of the same scene definition", async () => {
        const manager = createSceneManager<TestPhase, TestCtx, TestRun>();

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
        const manager = createSceneManager<TestPhase, TestCtx, TestRun>();
        const ctx: TestCtx = { log: [] };

        await manager.start();
        manager.commands.request.push(
            createSceneWithPassSystem("demo.scene", "fixedUpdate"),
        );
        manager.flush();

        manager.execute({ pass: "fixedUpdate", ctx, run: 16 });

        expect(ctx.log).toEqual(["demo.scene.fixedUpdate:16"]);
    });

    it("does not execute queued scenes before flush", async () => {
        const manager = createSceneManager<TestPhase, TestCtx, TestRun>();
        const ctx: TestCtx = { log: [] };

        await manager.start();
        manager.commands.request.push(
            createSceneWithPassSystem("demo.scene", "fixedUpdate"),
        );

        manager.execute({ pass: "fixedUpdate", ctx, run: 16 });

        expect(ctx.log).toEqual([]);
    });

    it("executes input from top to bottom", async () => {
        const manager = createSceneManager<TestPhase, TestCtx, TestRun>();
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

    it("executes fixed update from bottom to top", async () => {
        const manager = createSceneManager<TestPhase, TestCtx, TestRun>();
        const ctx: TestCtx = { log: [] };

        await manager.start();
        manager.commands.request.push(
            createSceneWithPassSystem("bottom", "fixedUpdate"),
        );
        manager.commands.request.push(
            createSceneWithPassSystem("top", "fixedUpdate"),
        );
        manager.flush();

        manager.execute({ pass: "fixedUpdate", ctx, run: 2 });

        expect(ctx.log).toEqual(["bottom.fixedUpdate:2", "top.fixedUpdate:2"]);
    });

    it("executes pre-render from bottom to top", async () => {
        const manager = createSceneManager<TestPhase, TestCtx, TestRun>();
        const ctx: TestCtx = { log: [] };

        await manager.start();
        manager.commands.request.push(
            createSceneWithPassSystem("bottom", "preRender"),
        );
        manager.commands.request.push(
            createSceneWithPassSystem("top", "preRender"),
        );
        manager.flush();

        manager.execute({ pass: "preRender", ctx, run: 0.5 });

        expect(ctx.log).toEqual(["bottom.preRender:0.5", "top.preRender:0.5"]);
    });

    it("honors capturesInput by excluding scenes below the topmost capture", async () => {
        const manager = createSceneManager<TestPhase, TestCtx, TestRun>();
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

    it("honors blocksUpdateBelow for fixed update and pre-render", async () => {
        const manager = createSceneManager<TestPhase, TestCtx, TestRun>();
        const fixedCtx: TestCtx = { log: [] };
        const renderCtx: TestCtx = { log: [] };

        await manager.start();
        manager.commands.request.push(
            createTestScene({
                instanceId: "base",
                systems: [
                    createTestSystem("base.fixedUpdate", "fixedUpdate"),
                    createTestSystem("base.preRender", "preRender"),
                ],
            }),
        );
        manager.commands.request.push(
            createTestScene({
                instanceId: "menu",
                policy: { blocksUpdateBelow: true },
                systems: [
                    createTestSystem("menu.fixedUpdate", "fixedUpdate"),
                    createTestSystem("menu.preRender", "preRender"),
                ],
            }),
        );
        manager.commands.request.push(
            createTestScene({
                instanceId: "tooltip",
                systems: [
                    createTestSystem("tooltip.fixedUpdate", "fixedUpdate"),
                    createTestSystem("tooltip.preRender", "preRender"),
                ],
            }),
        );
        manager.flush();

        manager.execute({ pass: "fixedUpdate", ctx: fixedCtx, run: 2 });
        manager.execute({ pass: "preRender", ctx: renderCtx, run: 0.5 });

        expect(fixedCtx.log).toEqual([
            "menu.fixedUpdate:2",
            "tooltip.fixedUpdate:2",
        ]);
        expect(renderCtx.log).toEqual([
            "menu.preRender:0.5",
            "tooltip.preRender:0.5",
        ]);
    });

    it("does nothing after stop without throwing", async () => {
        const manager = createSceneManager<TestPhase, TestCtx, TestRun>();
        const ctx: TestCtx = { log: [] };

        await manager.start();
        manager.commands.request.push(
            createSceneWithPassSystem("demo.scene", "fixedUpdate"),
        );
        manager.flush();
        await manager.stop();

        expect(() =>
            manager.execute({ pass: "fixedUpdate", ctx, run: 16 }),
        ).not.toThrow();
        expect(ctx.log).toEqual([]);
    });

    it("throws after dispose in debug mode", async () => {
        const manager = createSceneManager<TestPhase, TestCtx, TestRun>({
            debug: true,
        });
        const ctx: TestCtx = { log: [] };

        await manager.start();
        await manager.dispose();

        expect(() =>
            manager.execute({ pass: "fixedUpdate", ctx, run: 16 }),
        ).toThrow("SceneManager: called after dispose()");
    });
});
