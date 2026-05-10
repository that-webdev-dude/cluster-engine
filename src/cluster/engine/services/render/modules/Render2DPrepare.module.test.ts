import { describe, expect, it } from "vitest";
import { createRender2DPrepare } from "./Render2DPrepare.module";
import type { RenderFrameInput, RenderItem2D } from "../service/Render.types";

function createInput(
    layers: RenderFrameInput["layers"],
    alpha = 0.5,
): RenderFrameInput {
    return {
        target: { w: 320, h: 240, dpr: 2 },
        alpha,
        layers,
    };
}

function createRect(overrides: Partial<Extract<RenderItem2D, { kind: "rect" }>> = {}) {
    return {
        kind: "rect" as const,
        sortKey: 0,
        x: 0,
        y: 0,
        w: 1,
        h: 1,
        ...overrides,
    };
}

describe("createRender2DPrepare", () => {
    it("accepts empty layers and item lists", () => {
        const prepare = createRender2DPrepare();
        const frame = prepare.prepare(
            createInput([
                {
                    id: "empty",
                    order: 0,
                    items: [],
                },
            ]),
        );

        expect(frame.items).toEqual([]);
        expect(frame.batches).toEqual([]);
        expect(frame.stats).toMatchObject({
            passCount: 1,
            commandCount: 0,
            batchCount: 0,
            vertexCount: 0,
        });
    });

    it("sorts layers by order and items by sort key with stable ties", () => {
        const prepare = createRender2DPrepare();
        const frame = prepare.prepare(
            createInput([
                {
                    id: "foreground",
                    order: 10,
                    items: [
                        {
                            ...createRect({ sortKey: 2 }),
                        },
                    ],
                },
                {
                    id: "background",
                    order: 0,
                    items: [
                        {
                            ...createRect({ sortKey: 5 }),
                        },
                        {
                            ...createRect({ sortKey: 1 }),
                        },
                        {
                            ...createRect({ sortKey: 1 }),
                        },
                    ],
                },
            ]),
        );

        expect(
            frame.items.map((item) => ({
                layerId: item.layerId,
                sortKey: item.sortKey,
                sourceIndex: item.sourceIndex,
            })),
        ).toEqual([
            { layerId: "background", sortKey: 1, sourceIndex: 1 },
            { layerId: "background", sortKey: 1, sourceIndex: 2 },
            { layerId: "background", sortKey: 5, sourceIndex: 0 },
            { layerId: "foreground", sortKey: 2, sourceIndex: 0 },
        ]);
    });

    it("skips invalid-size items without breaking stats", () => {
        const prepare = createRender2DPrepare();
        const frame = prepare.prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [
                        createRect({ w: 0 }),
                        createRect({ h: -1 }),
                        createRect({ sortKey: 2 }),
                    ],
                },
            ]),
        );

        expect(frame.items).toHaveLength(1);
        expect(frame.batches).toHaveLength(1);
        expect(frame.stats).toMatchObject({
            commandCount: 1,
            batchCount: 1,
            vertexCount: 6,
        });
    });

    it("counts mixed renderer-domain item vertices", () => {
        const prepare = createRender2DPrepare();
        const frame = prepare.prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [
                        createRect({ sortKey: 0 }),
                        {
                            kind: "sprite",
                            sortKey: 1,
                            x: 0,
                            y: 0,
                            w: 2,
                            h: 2,
                            resourceId: "sprite.a",
                        },
                        {
                            kind: "line",
                            sortKey: 2,
                            startX: 0,
                            startY: 0,
                            endX: 10,
                            endY: 0,
                        },
                        {
                            kind: "polygon",
                            sortKey: 3,
                            x: 0,
                            y: 0,
                            vertices: [
                                { x: 0, y: 0 },
                                { x: 10, y: 0 },
                                { x: 10, y: 10 },
                                { x: 0, y: 10 },
                            ],
                        },
                    ],
                },
            ]),
        );

        expect(frame.items.map((item) => item.vertexCount)).toEqual([
            6, 6, 6, 6,
        ]);
        expect(frame.stats).toMatchObject({
            commandCount: 4,
            vertexCount: 24,
        });
    });

    it("batches adjacent compatible prepared items", () => {
        const prepare = createRender2DPrepare();
        const frame = prepare.prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [
                        createRect({ sortKey: 0 }),
                        createRect({ sortKey: 1 }),
                        createRect({ sortKey: 2 }),
                    ],
                },
            ]),
        );

        expect(frame.batches).toEqual([
            expect.objectContaining({
                layerId: "main",
                pipelineFamily: "solid-2d",
                vertexLayout: "position-color-2d",
                blendMode: "opaque",
                itemStart: 0,
                itemCount: 3,
                vertexCount: 18,
            }),
        ]);
        expect(frame.stats.batchCount).toBe(1);
    });

    it("splits batches on layer, pipeline, layout, blend mode, and resource id", () => {
        const prepare = createRender2DPrepare();
        const frame = prepare.prepare(
            createInput([
                {
                    id: "background",
                    order: 0,
                    items: [
                        createRect({ sortKey: 0, resourceId: "solid.shared" }),
                        createRect({ sortKey: 1, resourceId: "solid.shared" }),
                        createRect({ sortKey: 2, resourceId: "solid.other" }),
                        createRect({ sortKey: 3, blend: "alpha" }),
                        {
                            kind: "sprite",
                            sortKey: 4,
                            x: 0,
                            y: 0,
                            w: 1,
                            h: 1,
                            resourceId: "sprite.a",
                        },
                    ],
                },
                {
                    id: "foreground",
                    order: 1,
                    items: [createRect({ sortKey: 0 })],
                },
            ]),
        );

        expect(
            frame.batches.map((batch) => ({
                layerId: batch.layerId,
                pipelineFamily: batch.pipelineFamily,
                vertexLayout: batch.vertexLayout,
                blendMode: batch.blendMode,
                resourceId: batch.resourceId,
                itemStart: batch.itemStart,
                itemCount: batch.itemCount,
            })),
        ).toEqual([
            {
                layerId: "background",
                pipelineFamily: "solid-2d",
                vertexLayout: "position-color-2d",
                blendMode: "opaque",
                resourceId: "solid.shared",
                itemStart: 0,
                itemCount: 2,
            },
            {
                layerId: "background",
                pipelineFamily: "solid-2d",
                vertexLayout: "position-color-2d",
                blendMode: "opaque",
                resourceId: "solid.other",
                itemStart: 2,
                itemCount: 1,
            },
            {
                layerId: "background",
                pipelineFamily: "solid-2d",
                vertexLayout: "position-color-2d",
                blendMode: "alpha",
                resourceId: undefined,
                itemStart: 3,
                itemCount: 1,
            },
            {
                layerId: "background",
                pipelineFamily: "textured-2d",
                vertexLayout: "position-uv-tint-2d",
                blendMode: "opaque",
                resourceId: "sprite.a",
                itemStart: 4,
                itemCount: 1,
            },
            {
                layerId: "foreground",
                pipelineFamily: "solid-2d",
                vertexLayout: "position-color-2d",
                blendMode: "opaque",
                resourceId: undefined,
                itemStart: 5,
                itemCount: 1,
            },
        ]);
        expect(frame.stats.batchCount).toBe(5);
    });

    it("keeps scale preparation deterministic for thousands of simple rects", () => {
        const prepare = createRender2DPrepare();
        const rects = Array.from({ length: 5_000 }, (_, index) =>
            createRect({ sortKey: index }),
        );
        const frame = prepare.prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: rects,
                },
            ]),
        );

        expect(frame.stats).toMatchObject({
            passCount: 1,
            commandCount: 5_000,
            batchCount: 1,
            vertexCount: 30_000,
        });
        expect(frame.batches[0]).toMatchObject({
            itemStart: 0,
            itemCount: 5_000,
            vertexCount: 30_000,
        });
    });

    it("resolves rect positions through fallback interpolation", () => {
        const prepare = createRender2DPrepare();
        const createFrameAt = (alpha: number) =>
            prepare.prepare(
                createInput(
                    [
                        {
                            id: "main",
                            order: 0,
                            items: [
                                {
                                    kind: "rect",
                                    sortKey: 0,
                                    prevX: 10,
                                    prevY: 20,
                                    x: 30,
                                    y: 60,
                                    w: 1,
                                    h: 1,
                                },
                            ],
                        },
                    ],
                    alpha,
                ),
            );

        expect(createFrameAt(0).items[0]).toMatchObject({ x: 10, y: 20 });
        expect(createFrameAt(0.5).items[0]).toMatchObject({ x: 20, y: 40 });
        expect(createFrameAt(1).items[0]).toMatchObject({ x: 30, y: 60 });
    });

    it("falls back to current transform values when previous values are missing", () => {
        const prepare = createRender2DPrepare();
        const frame = prepare.prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [
                        {
                            kind: "rect",
                            sortKey: 0,
                            x: 30,
                            y: 60,
                            w: 1,
                            h: 1,
                        },
                    ],
                },
            ]),
        );

        expect(frame.items[0]).toMatchObject({ x: 30, y: 60 });
    });

    it("rejects invalid alpha in debug mode", () => {
        const prepare = createRender2DPrepare({ debug: true });

        expect(() => prepare.prepare(createInput([], Number.NaN))).toThrow(
            "Render2DPrepare.prepare: alpha must be a finite number between 0 and 1",
        );
    });
});
