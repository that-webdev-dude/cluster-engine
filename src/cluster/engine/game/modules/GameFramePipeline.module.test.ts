import { describe, expect, it } from "vitest";
import { createGameFramePipeline } from "./GameFramePipeline.module";
import type { GameCtx, GamePrepareRenderCtx } from "../service/Game.types";
import type { DisplayView } from "../../services/display";
import type { InputView } from "../../services/input";
import type { SceneManagerService } from "../../managers/scene";
import type { WorldManagerService } from "../../managers/world";

function createTestDisplay(): DisplayView {
    return {
        rev: 0,
        w: 320,
        h: 240,
        dpr: 1,
        changed: false,
        cssToSurface(x, y, out) {
            const result = out ?? { x: 0, y: 0 };
            result.x = x;
            result.y = y;
            return result;
        },
        surfaceToCss(x, y, out) {
            const result = out ?? { x: 0, y: 0 };
            result.x = x;
            result.y = y;
            return result;
        },
        surfaceToClient(x, y, out) {
            const result = out ?? { x: 0, y: 0 };
            result.x = x;
            result.y = y;
            return result;
        },
        clientToSurface(clientX, clientY, out) {
            const result = out ?? { x: 0, y: 0 };
            result.x = clientX;
            result.y = clientY;
            return result;
        },
    };
}

function createTestInput(): InputView {
    return {
        keyboard: {
            down() {
                return false;
            },
            pressed() {
                return false;
            },
            released() {
                return false;
            },
        },
        pointer: {
            x: 0,
            y: 0,
            dx: 0,
            dy: 0,
            wheelX: 0,
            wheelY: 0,
            buttons: {
                down() {
                    return false;
                },
                pressed() {
                    return false;
                },
                released() {
                    return false;
                },
            },
            pointers: {
                count: 0,
                has() {
                    return false;
                },
                get() {
                    return false;
                },
                forEach() {},
            },
        },
    };
}

function createTestCtx(_scopeId: string = "test.scope"): GameCtx {
    return {
        display: createTestDisplay(),
        input: createTestInput(),
        scene: {
            request: {
                set() {},
                push() {},
                pop() {},
            },
        },
        world: {
            query() {
                return [];
            },
            commands: {
                request: {
                    spawn() {},
                    destroy() {},
                    clear() {},
                },
            },
        },
    };
}

function createTestPrepareRenderCtx(alpha: number): GamePrepareRenderCtx {
    return {
        alpha,
        display: createTestDisplay(),
        input: createTestInput(),
        sceneStack: { instanceIds: [] },
        world: {
            storeCount: 0,
            entityCount: 0,
            stores: [],
        },
    };
}

function createFakeSceneManager(
    log: string[],
): SceneManagerService<GameCtx, number> {
    return {
        start: async () => true,
        stop: async () => true,
        dispose: async () => true,
        flush() {
            log.push("scene.flush");
        },
        execute(args) {
            log.push(`scene.execute:${args.pass}:${args.run}`);
        },
        scopedExecute(args) {
            log.push(`scene.scopedExecute:${args.pass}:${args.run}`);
            args.scope("test.scope");
        },
        view: {
            rev: 0,
            changed: false,
            stack: { instanceIds: [] },
            input: { order: "topToBottom", instanceIds: [] },
            update: { order: "bottomToTop", instanceIds: [] },
        },
        commands: {
            request: {
                set() {},
                push() {},
                pop() {},
            },
        },
    };
}

function createFakeWorldManager(log: string[]): WorldManagerService {
    return {
        start: async () => true,
        stop: async () => true,
        dispose: async () => true,
        flush() {
            log.push("world.flush");
        },
        publish() {
            log.push("world.publish");
        },
        query() {
            return [];
        },
        view: {
            rev: 0,
            changed: false,
            storeCount: 0,
            entityCount: 0,
            debug: {
                storeCount: 0,
                entityCount: 0,
                stores: [],
            },
        },
        commands: {
            request: {
                spawn() {},
                destroy() {},
                clearStore() {},
                clear() {},
            },
        },
    };
}

describe("createGameFramePipeline", () => {
    it("flushes scene changes and publishes world before creating frame context", () => {
        const log: string[] = [];
        const pipeline = createGameFramePipeline({
            sceneManager: createFakeSceneManager(log),
            worldManager: createFakeWorldManager(log),
            createGameCtx: createTestCtx,
            createPrepareRenderCtx: createTestPrepareRenderCtx,
        });

        const result = pipeline.beginUpdate();

        expect(result).toBeUndefined();
        expect(log).toEqual(["scene.flush", "world.flush", "world.publish"]);
    });

    it("executes input through scoped scene execution", () => {
        const log: string[] = [];
        const pipeline = createGameFramePipeline({
            sceneManager: createFakeSceneManager(log),
            worldManager: createFakeWorldManager(log),
            createGameCtx: createTestCtx,
            createPrepareRenderCtx: createTestPrepareRenderCtx,
        });

        pipeline.input();

        expect(log).toEqual(["scene.scopedExecute:input:0"]);
    });

    it("executes update through scoped scene execution", () => {
        const log: string[] = [];
        const pipeline = createGameFramePipeline({
            sceneManager: createFakeSceneManager(log),
            worldManager: createFakeWorldManager(log),
            createGameCtx: createTestCtx,
            createPrepareRenderCtx: createTestPrepareRenderCtx,
        });

        pipeline.update(16);

        expect(log).toEqual(["scene.scopedExecute:update:16"]);
    });

    it("flushes, publishes, and invokes prepareRender with read-only context", () => {
        const log: string[] = [];
        const pipeline = createGameFramePipeline({
            sceneManager: createFakeSceneManager(log),
            worldManager: createFakeWorldManager(log),
            createGameCtx: createTestCtx,
            createPrepareRenderCtx: (alpha) => {
                log.push(`createPrepareRenderCtx:${alpha}`);
                return createTestPrepareRenderCtx(alpha);
            },
            prepareRender(ctx) {
                log.push(`prepareRender:${ctx.alpha}`);
                expect("scene" in ctx).toBe(false);
                expect("commands" in ctx.world).toBe(false);
                expect("query" in ctx.world).toBe(false);
            },
        });

        pipeline.prepareRender(0.5);

        expect(log).toEqual([
            "world.flush",
            "world.publish",
            "createPrepareRenderCtx:0.5",
            "prepareRender:0.5",
        ]);
    });

    it("keeps render as a placeholder boundary without executing systems", () => {
        const log: string[] = [];
        const pipeline = createGameFramePipeline({
            sceneManager: createFakeSceneManager(log),
            worldManager: createFakeWorldManager(log),
            createGameCtx: createTestCtx,
            createPrepareRenderCtx: createTestPrepareRenderCtx,
        });

        pipeline.render(0.25);

        expect(log).toEqual([]);
    });
});
