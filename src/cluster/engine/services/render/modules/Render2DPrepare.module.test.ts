import { describe, expect, it } from "vitest";
import {
    createRender2DPrepare,
    type Render2DPreparedFrame,
} from "./Render2DPrepare.module";
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

function activeItems(frame: Render2DPreparedFrame) {
    return frame.items.slice(0, frame.itemCount);
}

function activeBatches(frame: Render2DPreparedFrame) {
    return frame.batches.slice(0, frame.batchCount);
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

        expect(frame.itemCount).toBe(0);
        expect(frame.batchCount).toBe(0);
        expect(activeItems(frame)).toEqual([]);
        expect(activeBatches(frame)).toEqual([]);
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
            activeItems(frame).map((item) => ({
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

        expect(frame.itemCount).toBe(1);
        expect(frame.batchCount).toBe(1);
        expect(activeItems(frame)).toHaveLength(1);
        expect(activeBatches(frame)).toHaveLength(1);
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

        expect(activeItems(frame).map((item) => item.vertexCount)).toEqual([
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

        expect(frame.batchCount).toBe(1);
        expect(activeBatches(frame)).toEqual([
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
            activeBatches(frame).map((batch) => ({
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
        expect(frame.itemCount).toBe(5_000);
        expect(frame.batchCount).toBe(1);
        expect(activeBatches(frame)[0]).toMatchObject({
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

        expect(activeItems(createFrameAt(0))[0]).toMatchObject({
            x: 10,
            y: 20,
        });
        expect(activeItems(createFrameAt(0.5))[0]).toMatchObject({
            x: 20,
            y: 40,
        });
        expect(activeItems(createFrameAt(1))[0]).toMatchObject({
            x: 30,
            y: 60,
        });
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

        expect(activeItems(frame)[0]).toMatchObject({ x: 30, y: 60 });
    });

    it("ignores stale arena entries after preparing a smaller frame", () => {
        const prepare = createRender2DPrepare();
        const largerFrame = prepare.prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [
                        createRect({ sortKey: 0 }),
                        createRect({ sortKey: 1, resourceId: "solid.a" }),
                        createRect({ sortKey: 2, blend: "alpha" }),
                    ],
                },
            ]),
        );

        expect(largerFrame.itemCount).toBe(3);
        expect(largerFrame.batchCount).toBe(3);
        expect(largerFrame.items.length).toBeGreaterThanOrEqual(3);
        expect(largerFrame.batches.length).toBeGreaterThanOrEqual(3);

        const smallerFrame = prepare.prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [],
                },
            ]),
        );

        expect(smallerFrame.itemCount).toBe(0);
        expect(smallerFrame.batchCount).toBe(0);
        expect(activeItems(smallerFrame)).toEqual([]);
        expect(activeBatches(smallerFrame)).toEqual([]);
        expect(smallerFrame.stats).toMatchObject({
            passCount: 1,
            commandCount: 0,
            batchCount: 0,
            vertexCount: 0,
        });
        expect(smallerFrame.items.length).toBeGreaterThanOrEqual(3);
        expect(smallerFrame.batches.length).toBeGreaterThanOrEqual(3);
    });

    it("rejects invalid alpha in debug mode", () => {
        const prepare = createRender2DPrepare({ debug: true });

        expect(() => prepare.prepare(createInput([], Number.NaN))).toThrow(
            "Render2DPrepare.prepare: alpha must be a finite number between 0 and 1",
        );
    });
});
