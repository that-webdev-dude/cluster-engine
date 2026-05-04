import { describe, expect, it } from "vitest";
import { createGameFramePipeline } from "./GameFramePipeline.module";
import type { GameCtx } from "../service/Game.types";
import type { DisplayView } from "../../services/display";
import type {
    SceneExecutePassArgs,
    SceneManagerService,
} from "../../managers/scene";
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

function createTestCtx(): GameCtx {
    return {
        display: createTestDisplay(),
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
        execute(args: SceneExecutePassArgs<GameCtx, number>) {
            log.push(`scene.execute:${args.pass}:${args.run}`);
        },
        view: {
            rev: 0,
            changed: false,
            stack: { instanceIds: [] },
            input: { order: "topToBottom", instanceIds: [] },
            fixedUpdate: { order: "bottomToTop", instanceIds: [] },
            preRender: { order: "bottomToTop", instanceIds: [] },
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
        const ctx = createTestCtx();
        const pipeline = createGameFramePipeline({
            sceneManager: createFakeSceneManager(log),
            worldManager: createFakeWorldManager(log),
            createGameCtx() {
                log.push("createGameCtx");
                return ctx;
            },
        });

        const result = pipeline.beginUpdate();

        expect(result).toBe(ctx);
        expect(log).toEqual([
            "scene.flush",
            "world.flush",
            "world.publish",
            "createGameCtx",
        ]);
    });

    it("executes input before fixed update during fixed update", () => {
        const log: string[] = [];
        const pipeline = createGameFramePipeline({
            sceneManager: createFakeSceneManager(log),
            worldManager: createFakeWorldManager(log),
            createGameCtx: createTestCtx,
        });

        pipeline.fixedUpdate(createTestCtx(), 16);

        expect(log).toEqual([
            "scene.execute:input:16",
            "scene.execute:fixedUpdate:16",
        ]);
    });

    it("executes pre-render during pre-render", () => {
        const log: string[] = [];
        const pipeline = createGameFramePipeline({
            sceneManager: createFakeSceneManager(log),
            worldManager: createFakeWorldManager(log),
            createGameCtx: createTestCtx,
        });

        pipeline.preRender(createTestCtx(), 0.5);

        expect(log).toEqual(["scene.execute:preRender:0.5"]);
    });

    it("flushes and publishes world during render", () => {
        const log: string[] = [];
        const pipeline = createGameFramePipeline({
            sceneManager: createFakeSceneManager(log),
            worldManager: createFakeWorldManager(log),
            createGameCtx: createTestCtx,
        });

        pipeline.render(0.25);

        expect(log).toEqual(["world.flush", "world.publish"]);
    });
});
