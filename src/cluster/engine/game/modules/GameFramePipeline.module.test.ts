import { describe, expect, it } from "vitest";
import { createGameFramePipeline } from "./GameFramePipeline.module";
import type { GameCtx } from "../service/Game.types";
import type { SceneManagerService } from "../../managers/scene";
import type { WorldManagerService } from "../../managers/world";
import type {
    RenderFrameInput,
    RenderService,
    RenderSubmitResult,
    RenderView,
} from "../../services/render";

type WorldQueryRow = ReturnType<WorldManagerService["query"]>[number];

const ZERO_STATS = {
    passCount: 0,
    commandCount: 0,
    batchCount: 0,
    drawCallCount: 0,
    vertexCount: 0,
    skippedResourceCount: 0,
    fallbackResourceCount: 0,
    textureResourceCount: 0,
    fontResourceCount: 0,
    fontPageResourceCount: 0,
    fontReplacementRegistrationCount: 0,
    invalidFontRegistrationCount: 0,
    missingFontCount: 0,
    missingGlyphCount: 0,
};

function createTestCtx(_scopeId: string = "test.scope"): GameCtx {
    return {
        display: {
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
        },
        input: {
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
        },
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
    instanceIds: readonly string[] = [],
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
            stack: { instanceIds },
            input: { order: "topToBottom", instanceIds },
            update: { order: "bottomToTop", instanceIds },
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

function createQueryRow(
    entityId: string,
    components: Record<string, Record<string, number>>,
): WorldQueryRow {
    const boundComponents: Record<
        string,
        Record<string, { read(): number; write(value: number): void }>
    > = Object.create(null);

    for (const [componentName, fields] of Object.entries(components)) {
        const boundFields: Record<
            string,
            { read(): number; write(value: number): void }
        > = Object.create(null);

        for (const [fieldName, value] of Object.entries(fields)) {
            boundFields[fieldName] = {
                read() {
                    return value;
                },
                write() {},
            };
        }

        boundComponents[componentName] = boundFields;
    }

    return {
        entityId,
        storeId: "store.test",
        archetypeId: "position|size",
        components: boundComponents,
    };
}

function createFakeWorldManager(
    log: string[],
    rowsByStoreId: ReadonlyMap<string, readonly WorldQueryRow[]> = new Map(),
): WorldManagerService {
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
        query(storeId, componentNames) {
            const rows = rowsByStoreId.get(storeId) ?? [];

            return rows.filter((row) =>
                componentNames.every(
                    (componentName) => row.components[componentName],
                ),
            );
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

function createFakeRender(log: string[]): RenderService & {
    readonly preparedInputs: readonly RenderFrameInput[];
    readonly executeCount: number;
} {
    const preparedInputs: RenderFrameInput[] = [];
    let executeCount = 0;
    const view: RenderView = {
        backend: "none",
        gfxState: "unavailable",
        frameSeq: 0,
        target: { w: 0, h: 0, dpr: 1 },
        lastSubmitResult: { status: "no-frame" },
        stats: ZERO_STATS,
    };

    return {
        view,
        get preparedInputs() {
            return preparedInputs;
        },
        get executeCount() {
            return executeCount;
        },
        start: async () => true,
        stop: async () => true,
        dispose: async () => true,
        register: {
            textures() {},
            fonts() {},
        },
        prepare(input) {
            log.push("render.prepare");
            preparedInputs.push(input);
        },
        execute(): RenderSubmitResult {
            executeCount++;
            log.push("render.execute");
            return { status: "submitted" };
        },
    };
}

describe("createGameFramePipeline", () => {
    it("flushes scene changes and publishes world before update phases", () => {
        const log: string[] = [];
        const pipeline = createGameFramePipeline({
            sceneManager: createFakeSceneManager(log),
            worldManager: createFakeWorldManager(log),
            render: createFakeRender(log),
            createGameCtx: createTestCtx,
            createRenderTarget: () => ({ w: 320, h: 240, dpr: 1 }),
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
            render: createFakeRender(log),
            createGameCtx: createTestCtx,
            createRenderTarget: () => ({ w: 320, h: 240, dpr: 1 }),
        });

        pipeline.input();

        expect(log).toEqual(["scene.scopedExecute:input:0"]);
    });

    it("executes update through scoped scene execution", () => {
        const log: string[] = [];
        const pipeline = createGameFramePipeline({
            sceneManager: createFakeSceneManager(log),
            worldManager: createFakeWorldManager(log),
            render: createFakeRender(log),
            createGameCtx: createTestCtx,
            createRenderTarget: () => ({ w: 320, h: 240, dpr: 1 }),
        });

        pipeline.update(16);

        expect(log).toEqual(["scene.scopedExecute:update:16"]);
    });

    it("flushes, publishes, extracts frame input, and prepares render", () => {
        const log: string[] = [];
        const render = createFakeRender(log);
        const pipeline = createGameFramePipeline({
            sceneManager: createFakeSceneManager(log, ["store.b", "store.a"]),
            worldManager: createFakeWorldManager(
                log,
                new Map([
                    [
                        "store.a",
                        [
                            createQueryRow("entity.a", {
                                position: { x: 10, y: 20 },
                                size: { w: 30, h: 40 },
                            }),
                        ],
                    ],
                    [
                        "store.b",
                        [
                            createQueryRow("entity.b", {
                                position: { x: 50, y: 60 },
                                size: { w: 70, h: 80 },
                            }),
                        ],
                    ],
                ]),
            ),
            render,
            createGameCtx: createTestCtx,
            createRenderTarget: () => ({ w: 640, h: 480, dpr: 2 }),
        });

        pipeline.prepareRender(0.5);

        expect(log).toEqual([
            "world.flush",
            "world.publish",
            "render.prepare",
        ]);
        expect(render.preparedInputs).toHaveLength(1);
        expect(render.preparedInputs[0]).toMatchObject({
            alpha: 0.5,
            target: { w: 640, h: 480, dpr: 2 },
            layers: [
                {
                    id: "game.layer.0",
                    order: 0,
                    items: [expect.objectContaining({ kind: "rect", x: 50 })],
                },
                {
                    id: "game.layer.1",
                    order: 1,
                    items: [expect.objectContaining({ kind: "rect", x: 10 })],
                },
            ],
        });
    });

    it("executes render only after a prepared frame and consumes that frame", () => {
        const log: string[] = [];
        const render = createFakeRender(log);
        const pipeline = createGameFramePipeline({
            sceneManager: createFakeSceneManager(log),
            worldManager: createFakeWorldManager(log),
            render,
            createGameCtx: createTestCtx,
            createRenderTarget: () => ({ w: 320, h: 240, dpr: 1 }),
        });

        pipeline.render(0.25);
        pipeline.prepareRender(0.5);
        pipeline.render(0.5);
        pipeline.render(0.75);

        expect(render.executeCount).toBe(1);
        expect(log).toEqual([
            "world.flush",
            "world.publish",
            "render.prepare",
            "render.execute",
        ]);
    });
});
