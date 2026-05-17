import { describe, expect, it } from "vitest";
import {
    createRender2DPrepare,
    type Render2DPreparedFrame,
} from "./Render2DPrepare.module";
import { createFontRegistry } from "./FontRegistry.module";
import { createTextLayout } from "./TextLayout.module";
import type {
    RenderBitmapFontConfig,
    RenderFrameInput,
    RenderItem2D,
} from "../service/Render.types";

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

function createFont(
    overrides: Partial<RenderBitmapFontConfig> = {},
): RenderBitmapFontConfig {
    return {
        id: "font.ui",
        kind: "bitmap",
        baseSize: 10,
        lineHeight: 12,
        baseline: 9,
        pages: [
            {
                id: "main",
                resourceId: "font.ui.page.main",
                width: 100,
                height: 50,
            },
            {
                id: "accent",
                resourceId: "font.ui.page.accent",
                width: 100,
                height: 50,
            },
        ],
        glyphs: [
            {
                codepoint: 65,
                pageId: "main",
                x: 0,
                y: 0,
                w: 10,
                h: 8,
                xOffset: 0,
                yOffset: 0,
                xAdvance: 10,
            },
            {
                codepoint: 66,
                pageId: "main",
                x: 10,
                y: 0,
                w: 8,
                h: 8,
                xOffset: 1,
                yOffset: 0,
                xAdvance: 8,
            },
            {
                codepoint: 67,
                pageId: "accent",
                x: 0,
                y: 0,
                w: 6,
                h: 8,
                xOffset: 0,
                yOffset: 1,
                xAdvance: 6,
            },
        ],
        ...overrides,
    };
}

function createTextPrepare(font: RenderBitmapFontConfig = createFont()) {
    const registry = createFontRegistry({ debug: true });
    registry.register([font]);
    return createRender2DPrepare({
        fontRegistry: registry,
        textLayout: createTextLayout(),
    });
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

    it("lowers public text intent into private glyph quads", () => {
        const prepare = createTextPrepare();
        const frame = prepare.prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [
                        {
                            kind: "text",
                            sortKey: 0,
                            x: 5,
                            y: 7,
                            text: "AB",
                            fontId: "font.ui",
                        },
                    ],
                },
            ]),
        );

        expect(frame.itemCount).toBe(2);
        expect(activeItems(frame).map((item) => item.sourceKind)).toEqual([
            "text",
            "text",
        ]);
        expect(activeItems(frame).map((item) => item.kind)).toEqual([
            "glyph-quad",
            "glyph-quad",
        ]);
        expect(activeItems(frame).map((item) => item.resourceId)).toEqual([
            "font.ui.page.main",
            "font.ui.page.main",
        ]);
        expect(activeItems(frame).map((item) => item.geometry)).toEqual([
            expect.objectContaining({
                kind: "glyph-quad",
                glyphIndex: 0,
                x: 0,
                y: 0,
                w: 10,
                h: 8,
            }),
            expect.objectContaining({
                kind: "glyph-quad",
                glyphIndex: 1,
                x: 11,
                y: 0,
                w: 8,
                h: 8,
            }),
        ]);
        expect(activeItems(frame)[0]).not.toHaveProperty("item");
        expect(frame.stats).toMatchObject({
            commandCount: 2,
            vertexCount: 12,
            textItemCount: 1,
            preparedGlyphCount: 2,
            glyphVertexCount: 12,
            missingFontCount: 0,
            missingGlyphCount: 0,
        });
    });

    it("propagates text style, opacity, transform, and alpha blend default", () => {
        const prepare = createTextPrepare();
        const frame = prepare.prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [
                        {
                            kind: "text",
                            sortKey: 0,
                            x: 20,
                            y: 40,
                            prevX: 10,
                            prevY: 20,
                            text: "A",
                            fontId: "font.ui",
                            color: { r: 0.1, g: 0.2, b: 0.3 },
                            tint: { r: 0.4, g: 0.5, b: 0.6 },
                            opacity: 0.25,
                        },
                    ],
                },
            ]),
        );

        expect(activeItems(frame)[0]).toMatchObject({
            x: undefined,
            y: undefined,
            transform: undefined,
            instanceTransform: expect.objectContaining({
                x: 20,
                y: 40,
                prevX: 10,
                prevY: 20,
            }),
            blendMode: "alpha",
            color: { r: 0.4, g: 0.5, b: 0.6, a: 0.25 },
        });
    });

    it("keeps text source order, sort order, and glyph order stable", () => {
        const prepare = createTextPrepare();
        const frame = prepare.prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [
                        {
                            kind: "text",
                            sortKey: 2,
                            x: 0,
                            y: 0,
                            text: "A",
                            fontId: "font.ui",
                        },
                        createRect({ sortKey: 1 }),
                        {
                            kind: "text",
                            sortKey: 1,
                            x: 0,
                            y: 0,
                            text: "AB",
                            fontId: "font.ui",
                        },
                    ],
                },
            ]),
        );

        expect(
            activeItems(frame).map((item) => ({
                sourceKind: item.sourceKind,
                sourceIndex: item.sourceIndex,
                sortKey: item.sortKey,
                glyphIndex:
                    item.geometry.kind === "glyph-quad"
                        ? item.geometry.glyphIndex
                        : undefined,
            })),
        ).toEqual([
            {
                sourceKind: "rect",
                sourceIndex: 1,
                sortKey: 1,
                glyphIndex: undefined,
            },
            { sourceKind: "text", sourceIndex: 2, sortKey: 1, glyphIndex: 0 },
            { sourceKind: "text", sourceIndex: 2, sortKey: 1, glyphIndex: 1 },
            { sourceKind: "text", sourceIndex: 0, sortKey: 2, glyphIndex: 0 },
        ]);
    });

    it("batches same-page glyphs and splits multi-page glyph runs", () => {
        const prepare = createTextPrepare();
        const frame = prepare.prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [
                        {
                            kind: "text",
                            sortKey: 0,
                            x: 0,
                            y: 0,
                            text: "ABC",
                            fontId: "font.ui",
                        },
                    ],
                },
            ]),
        );

        expect(activeBatches(frame)).toEqual([
            expect.objectContaining({
                pipelineFamily: "textured-2d",
                vertexLayout: "position-uv-tint-2d",
                blendMode: "alpha",
                resourceId: "font.ui.page.main",
                containsText: true,
                itemStart: 0,
                itemCount: 2,
                vertexCount: 12,
            }),
            expect.objectContaining({
                pipelineFamily: "textured-2d",
                vertexLayout: "position-uv-tint-2d",
                blendMode: "alpha",
                resourceId: "font.ui.page.accent",
                containsText: true,
                itemStart: 2,
                itemCount: 1,
                vertexCount: 6,
            }),
        ]);
        expect(frame.stats).toMatchObject({
            batchCount: 2,
            textBatchCount: 2,
            preparedGlyphCount: 3,
        });
    });

    it("keeps text mixed with rects and sprites on the prepared geometry path", () => {
        const prepare = createTextPrepare();
        const frame = prepare.prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [
                        createRect({ sortKey: 0 }),
                        {
                            kind: "text",
                            sortKey: 1,
                            x: 0,
                            y: 0,
                            text: "A",
                            fontId: "font.ui",
                        },
                        {
                            kind: "sprite",
                            sortKey: 2,
                            x: 0,
                            y: 0,
                            w: 1,
                            h: 1,
                            resourceId: "sprite.a",
                        },
                    ],
                },
            ]),
        );

        expect(activeItems(frame).map((item) => item.kind)).toEqual([
            "rect-quad",
            "glyph-quad",
            "rect-quad",
        ]);
        expect(activeItems(frame).map((item) => item.sourceKind)).toEqual([
            "rect",
            "text",
            "sprite",
        ]);
        expect(frame.stats).toMatchObject({
            commandCount: 3,
            batchCount: 3,
            vertexCount: 18,
            textBatchCount: 1,
        });
    });

    it("records missing fonts and missing glyphs during text lowering", () => {
        const prepare = createTextPrepare(
            createFont({
                glyphs: [
                    {
                        codepoint: 65,
                        pageId: "main",
                        x: 0,
                        y: 0,
                        w: 10,
                        h: 8,
                        xOffset: 0,
                        yOffset: 0,
                        xAdvance: 10,
                    },
                ],
            }),
        );
        const frame = prepare.prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [
                        {
                            kind: "text",
                            sortKey: 0,
                            x: 0,
                            y: 0,
                            text: "AZ",
                            fontId: "font.ui",
                        },
                        {
                            kind: "text",
                            sortKey: 1,
                            x: 0,
                            y: 0,
                            text: "A",
                            fontId: "font.missing",
                        },
                    ],
                },
            ]),
        );

        expect(frame.stats).toMatchObject({
            textItemCount: 2,
            preparedGlyphCount: 1,
            missingFontCount: 1,
            missingGlyphCount: 1,
        });
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

    it("keeps rect instance transforms raw for shader interpolation", () => {
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
            x: undefined,
            y: undefined,
            transform: undefined,
            instanceTransform: expect.objectContaining({
                prevX: 10,
                prevY: 20,
                x: 30,
                y: 60,
            }),
        });
        expect(activeItems(createFrameAt(0.5))[0]).toMatchObject({
            x: undefined,
            y: undefined,
            transform: undefined,
            instanceTransform: expect.objectContaining({
                prevX: 10,
                prevY: 20,
                x: 30,
                y: 60,
            }),
        });
        expect(activeItems(createFrameAt(1))[0]).toMatchObject({
            x: undefined,
            y: undefined,
            transform: undefined,
            instanceTransform: expect.objectContaining({
                prevX: 10,
                prevY: 20,
                x: 30,
                y: 60,
            }),
        });
    });

    it("preserves current instance transform values when previous values are missing", () => {
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

        expect(activeItems(frame)[0]).toMatchObject({
            x: undefined,
            y: undefined,
            transform: undefined,
            instanceTransform: expect.objectContaining({ x: 30, y: 60 }),
        });
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

    it("reuses command, color, and geometry slots without leaking stale primitive fields", () => {
        const prepare = createRender2DPrepare();
        const firstFrame = prepare.prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [
                        {
                            kind: "sprite",
                            sortKey: 0,
                            x: 1,
                            y: 2,
                            w: 10,
                            h: 20,
                            resourceId: "sprite.a",
                            uv: { u: 0.1, v: 0.2, w: 0.3, h: 0.4 },
                            tint: { r: 0.2, g: 0.3, b: 0.4 },
                            opacity: 0.5,
                        },
                    ],
                },
            ]),
        );
        const reusedCommand = activeItems(firstFrame)[0];
        const reusedColor = reusedCommand.color;
        const reusedRectGeometry = reusedCommand.geometry;

        expect(reusedCommand.geometry).toMatchObject({
            kind: "rect-quad",
            w: 10,
            h: 20,
            uv: { u: 0.1, v: 0.2, w: 0.3, h: 0.4 },
        });
        expect(reusedCommand.color).toEqual({ r: 0.2, g: 0.3, b: 0.4, a: 0.5 });

        const secondFrame = prepare.prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [
                        {
                            kind: "line",
                            sortKey: 0,
                            startX: 3,
                            startY: 4,
                            endX: 9,
                            endY: 10,
                            strokeWidth: 2,
                            color: { r: 0.6, g: 0.7, b: 0.8 },
                        },
                    ],
                },
            ]),
        );

        expect(activeItems(secondFrame)[0]).toBe(reusedCommand);
        expect(activeItems(secondFrame)[0].color).toBe(reusedColor);
        expect(activeItems(secondFrame)[0].geometry).not.toBe(reusedRectGeometry);
        expect(activeItems(secondFrame)[0]).toMatchObject({
            sourceKind: "line",
            kind: "line",
            vertexCount: 6,
            color: { r: 0.6, g: 0.7, b: 0.8, a: 1 },
            geometry: {
                kind: "line",
                startX: 3,
                startY: 4,
                endX: 9,
                endY: 10,
                strokeWidth: 2,
            },
        });
        expect(activeItems(secondFrame)[0].geometry).not.toHaveProperty("uv");
    });

    it("keeps text glyph arena data fresh across text, missing glyph, and missing font prepares", () => {
        const prepare = createTextPrepare();
        const firstFrame = prepare.prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [
                        {
                            kind: "text",
                            sortKey: 0,
                            x: 0,
                            y: 0,
                            text: "AC",
                            fontId: "font.ui",
                        },
                    ],
                },
            ]),
        );
        const firstGlyphCommand = activeItems(firstFrame)[0];
        const firstGlyphGeometry = firstGlyphCommand.geometry;

        expect(activeItems(firstFrame).map((item) => item.resourceId)).toEqual([
            "font.ui.page.main",
            "font.ui.page.accent",
        ]);
        expect(frameStatsPick(firstFrame)).toEqual({
            commandCount: 2,
            batchCount: 2,
            vertexCount: 12,
            textItemCount: 1,
            preparedGlyphCount: 2,
            missingFontCount: 0,
            missingGlyphCount: 0,
            textBatchCount: 2,
        });

        const secondFrame = prepare.prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [
                        {
                            kind: "text",
                            sortKey: 0,
                            x: 5,
                            y: 6,
                            text: "BZ",
                            fontId: "font.ui",
                        },
                        {
                            kind: "text",
                            sortKey: 1,
                            x: 0,
                            y: 0,
                            text: "A",
                            fontId: "font.missing",
                        },
                    ],
                },
            ]),
        );

        expect(activeItems(secondFrame)).toHaveLength(1);
        expect(activeItems(secondFrame)[0]).toBe(firstGlyphCommand);
        expect(activeItems(secondFrame)[0].geometry).toBe(firstGlyphGeometry);
        expect(activeItems(secondFrame)[0]).toMatchObject({
            sourceKind: "text",
            sourceIndex: 0,
            kind: "glyph-quad",
            resourceId: "font.ui.page.main",
            geometry: {
                kind: "glyph-quad",
                sourceIndex: 0,
                glyphIndex: 0,
                resourceId: "font.ui.page.main",
                x: 1,
                y: 0,
                w: 8,
                h: 8,
            },
        });
        expect(frameStatsPick(secondFrame)).toEqual({
            commandCount: 1,
            batchCount: 1,
            vertexCount: 6,
            textItemCount: 2,
            preparedGlyphCount: 1,
            missingFontCount: 1,
            missingGlyphCount: 1,
            textBatchCount: 1,
        });
    });

    it("keeps polygon keys, batching, stats, and degenerate skipping fresh across reused arenas", () => {
        const prepare = createTextPrepare();
        const firstFrame = prepare.prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [
                        {
                            kind: "polygon",
                            sortKey: 0,
                            x: 0,
                            y: 0,
                            vertices: [
                                { x: 0, y: 0 },
                                { x: 4, y: 0 },
                                { x: 4, y: 4 },
                            ],
                        },
                        createRect({ sortKey: 1 }),
                    ],
                },
            ]),
        );
        const polygonCommand = activeItems(firstFrame)[0];

        expect(polygonCommand.geometry).toEqual({
            kind: "polygon",
            vertices: [
                { x: 0, y: 0 },
                { x: 4, y: 0 },
                { x: 4, y: 4 },
            ],
            localGeometryKey: "0,0|4,0|4,4",
        });
        expect(frameStatsPick(firstFrame)).toMatchObject({
            commandCount: 2,
            batchCount: 1,
            vertexCount: 9,
        });

        const secondFrame = prepare.prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [
                        createRect({ sortKey: 0, w: 0 }),
                        {
                            kind: "polygon",
                            sortKey: 1,
                            x: 1,
                            y: 1,
                            vertices: [
                                { x: 1, y: 1 },
                                { x: 5, y: 1 },
                                { x: 5, y: 6 },
                                { x: 1, y: 6 },
                            ],
                        },
                        {
                            kind: "sprite",
                            sortKey: 2,
                            x: 0,
                            y: 0,
                            w: 2,
                            h: 2,
                            resourceId: "sprite.a",
                        },
                        {
                            kind: "text",
                            sortKey: 3,
                            x: 0,
                            y: 0,
                            text: "A",
                            fontId: "font.ui",
                        },
                    ],
                },
            ]),
        );

        expect(activeItems(secondFrame)[0]).toBe(polygonCommand);
        expect(activeItems(secondFrame).map((item) => item.sourceKind)).toEqual([
            "polygon",
            "sprite",
            "text",
        ]);
        expect(activeItems(secondFrame)[0].geometry).toEqual({
            kind: "polygon",
            vertices: [
                { x: 1, y: 1 },
                { x: 5, y: 1 },
                { x: 5, y: 6 },
                { x: 1, y: 6 },
            ],
            localGeometryKey: "1,1|5,1|5,6|1,6",
        });
        expect(
            activeBatches(secondFrame).map((batch) => ({
                pipelineFamily: batch.pipelineFamily,
                resourceId: batch.resourceId,
                itemStart: batch.itemStart,
                itemCount: batch.itemCount,
                vertexCount: batch.vertexCount,
                containsText: batch.containsText,
            })),
        ).toEqual([
            {
                pipelineFamily: "solid-2d",
                resourceId: undefined,
                itemStart: 0,
                itemCount: 1,
                vertexCount: 6,
                containsText: false,
            },
            {
                pipelineFamily: "textured-2d",
                resourceId: "sprite.a",
                itemStart: 1,
                itemCount: 1,
                vertexCount: 6,
                containsText: false,
            },
            {
                pipelineFamily: "textured-2d",
                resourceId: "font.ui.page.main",
                itemStart: 2,
                itemCount: 1,
                vertexCount: 6,
                containsText: true,
            },
        ]);
        expect(frameStatsPick(secondFrame)).toEqual({
            commandCount: 3,
            batchCount: 3,
            vertexCount: 18,
            textItemCount: 1,
            preparedGlyphCount: 1,
            missingFontCount: 0,
            missingGlyphCount: 0,
            textBatchCount: 1,
        });
    });

    it("rejects invalid alpha in debug mode", () => {
        const prepare = createRender2DPrepare({ debug: true });

        expect(() => prepare.prepare(createInput([], Number.NaN))).toThrow(
            "Render2DPrepare.prepare: alpha must be a finite number between 0 and 1",
        );
    });

    it("rejects invalid alpha before mutating active prepared frame state in debug mode", () => {
        const prepare = createRender2DPrepare({ debug: true });
        const frame = prepare.prepare(
            createInput([
                {
                    id: "main",
                    order: 0,
                    items: [createRect({ x: 7, y: 8, w: 9, h: 10 })],
                },
            ]),
        );
        const activeCommand = activeItems(frame)[0];

        expect(() =>
            prepare.prepare(
                createInput(
                    [
                        {
                            id: "main",
                            order: 0,
                            items: [
                                {
                                    kind: "line",
                                    sortKey: 0,
                                    startX: 1,
                                    startY: 2,
                                    endX: 3,
                                    endY: 4,
                                },
                            ],
                        },
                    ],
                    Number.POSITIVE_INFINITY,
                ),
            ),
        ).toThrow(
            "Render2DPrepare.prepare: alpha must be a finite number between 0 and 1",
        );

        expect(frame.itemCount).toBe(1);
        expect(frame.batchCount).toBe(1);
        expect(activeItems(frame)[0]).toBe(activeCommand);
        expect(activeItems(frame)[0]).toMatchObject({
            sourceKind: "rect",
            kind: "rect-quad",
            instanceTransform: expect.objectContaining({ x: 7, y: 8 }),
            geometry: { kind: "rect-quad", w: 9, h: 10 },
        });
        expect(frame.stats.commandCount).toBe(1);
    });
});

function frameStatsPick(frame: Render2DPreparedFrame) {
    return {
        commandCount: frame.stats.commandCount,
        batchCount: frame.stats.batchCount,
        vertexCount: frame.stats.vertexCount,
        textItemCount: frame.stats.textItemCount,
        preparedGlyphCount: frame.stats.preparedGlyphCount,
        missingFontCount: frame.stats.missingFontCount,
        missingGlyphCount: frame.stats.missingGlyphCount,
        textBatchCount: frame.stats.textBatchCount,
    };
}
