import { describe, expect, it } from "vitest";
import { createFontRegistry } from "./FontRegistry.module";
import { createRender2DHandoffAdapter } from "./Render2DHandoff.module";
import handoffSource from "./Render2DHandoff.module.ts?raw";
import { createRender2DPrepare } from "./Render2DPrepare.module";
import { createTextLayout } from "./TextLayout.module";
import type {
    RenderBitmapFontConfig,
    RenderFrameInput,
    RenderItem2D,
} from "../service/Render.types";

function createRect(
    overrides: Partial<Extract<RenderItem2D, { kind: "rect" }>> = {},
) {
    return {
        kind: "rect" as const,
        sortKey: 0,
        x: 0,
        y: 0,
        w: 10,
        h: 10,
        ...overrides,
    };
}

function createSprite(
    overrides: Partial<Extract<RenderItem2D, { kind: "sprite" }>> = {},
) {
    return {
        kind: "sprite" as const,
        sortKey: 0,
        x: 0,
        y: 0,
        w: 10,
        h: 10,
        resourceId: "sprite.a",
        ...overrides,
    };
}

function createFont(): RenderBitmapFontConfig {
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
                width: 64,
                height: 32,
            },
            {
                id: "accent",
                resourceId: "font.ui.page.accent",
                width: 64,
                height: 32,
            },
        ],
        glyphs: [
            {
                codepoint: 65,
                pageId: "main",
                x: 0,
                y: 0,
                w: 8,
                h: 10,
                xOffset: 0,
                yOffset: 0,
                xAdvance: 8,
            },
            {
                codepoint: 66,
                pageId: "accent",
                x: 8,
                y: 0,
                w: 6,
                h: 9,
                xOffset: 1,
                yOffset: 2,
                xAdvance: 7,
            },
        ],
    };
}

function createPrepareWithFont() {
    const fontRegistry = createFontRegistry({ debug: true });
    fontRegistry.register([createFont()]);
    return createRender2DPrepare({
        fontRegistry,
        textLayout: createTextLayout(),
    });
}

function createInput(): RenderFrameInput {
    return {
        target: { w: 320, h: 240, dpr: 2 },
        alpha: 0.25,
        camera: { x: 10, y: 20, zoom: 1.5, shakeX: 1, shakeY: 2 },
        layers: [
            {
                id: "ui",
                order: 1,
                items: [
                    createRect({ sortKey: 2, resourceId: "solid.a" }),
                    createRect({ sortKey: 2, resourceId: "solid.a", x: 20 }),
                    createRect({ sortKey: 3, resourceId: "solid.b" }),
                    createRect({ sortKey: 4, blend: "alpha" }),
                    createSprite({
                        sortKey: 5,
                        resourceId: "sprite.a",
                        uv: { u: 0.1, v: 0.2, w: 0.3, h: 0.4 },
                    }),
                    {
                        kind: "text",
                        sortKey: 6,
                        x: 1,
                        y: 2,
                        text: "ABZ",
                        fontId: "font.ui",
                    },
                    {
                        kind: "text",
                        sortKey: 7,
                        x: 1,
                        y: 2,
                        text: "A",
                        fontId: "font.missing",
                    },
                ],
            },
            {
                id: "world",
                order: 0,
                items: [
                    createRect({ sortKey: 10, w: 0 }),
                    createRect({ sortKey: 1 }),
                    {
                        kind: "line",
                        sortKey: 2,
                        startX: 0,
                        startY: 0,
                        endX: 8,
                        endY: 9,
                        strokeWidth: 2,
                    },
                    {
                        kind: "circle",
                        sortKey: 3,
                        x: 30,
                        y: 30,
                        radius: 4,
                    },
                    {
                        kind: "ellipse",
                        sortKey: 4,
                        x: 40,
                        y: 40,
                        radiusX: 5,
                        radiusY: 6,
                    },
                    {
                        kind: "polygon",
                        sortKey: 5,
                        x: 50,
                        y: 50,
                        vertices: [
                            { x: 0, y: 0 },
                            { x: 10, y: 0 },
                            { x: 10, y: 5 },
                            { x: 0, y: 5 },
                        ],
                    },
                    {
                        kind: "polygon",
                        sortKey: 6,
                        x: 60,
                        y: 60,
                        vertices: [
                            { x: 0, y: 0 },
                            { x: 1, y: 1 },
                        ],
                    },
                    {
                        kind: "line",
                        sortKey: 7,
                        startX: 1,
                        startY: 1,
                        endX: 1,
                        endY: 1,
                    },
                ],
            },
        ],
    };
}

describe("Render2DHandoff", () => {
    it("keeps the handoff private to renderer-domain module types", () => {
        expect(handoffSource).not.toMatch(
            /from\s+["'][^"']*(game|managers|scene|world|entity|query|ecs|backend|author)/i,
        );
        expect(handoffSource).not.toMatch(/Gfx|WebGL|WebGPU|Handle|QueryRow|Entity/);
    });

    it("adapts prepared frames through the private handoff without changing the frame shape", () => {
        const frame = createRender2DPrepare().prepare({
            target: { w: 10, h: 10, dpr: 1 },
            alpha: 1,
            layers: [{ id: "main", order: 0, items: [createRect()] }],
        });

        expect(createRender2DHandoffAdapter().fromPreparedFrame(frame)).toBe(
            frame,
        );
    });

    it("preserves ordering, command metadata, batching, stats, text, polygons, and degenerate skipping", () => {
        const frame = createPrepareWithFont().prepare(createInput());
        const commands = frame.items.slice(0, frame.itemCount);
        const batches = frame.batches.slice(0, frame.batchCount);

        expect(frame.target).toEqual({ w: 320, h: 240, dpr: 2 });
        expect(frame.alpha).toBe(0.25);
        expect(frame.camera).toEqual({
            x: 10,
            y: 20,
            zoom: 1.5,
            shakeX: 1,
            shakeY: 2,
        });
        expect(
            commands.map((command) => ({
                layerId: command.layerId,
                layerOrder: command.layerOrder,
                sourceKind: command.sourceKind,
                sourceIndex: command.sourceIndex,
                sortKey: command.sortKey,
                kind: command.kind,
            })),
        ).toEqual([
            {
                layerId: "world",
                layerOrder: 0,
                sourceKind: "rect",
                sourceIndex: 1,
                sortKey: 1,
                kind: "rect-quad",
            },
            {
                layerId: "world",
                layerOrder: 0,
                sourceKind: "line",
                sourceIndex: 2,
                sortKey: 2,
                kind: "line",
            },
            {
                layerId: "world",
                layerOrder: 0,
                sourceKind: "circle",
                sourceIndex: 3,
                sortKey: 3,
                kind: "circle-like",
            },
            {
                layerId: "world",
                layerOrder: 0,
                sourceKind: "ellipse",
                sourceIndex: 4,
                sortKey: 4,
                kind: "circle-like",
            },
            {
                layerId: "world",
                layerOrder: 0,
                sourceKind: "polygon",
                sourceIndex: 5,
                sortKey: 5,
                kind: "polygon",
            },
            {
                layerId: "ui",
                layerOrder: 1,
                sourceKind: "rect",
                sourceIndex: 0,
                sortKey: 2,
                kind: "rect-quad",
            },
            {
                layerId: "ui",
                layerOrder: 1,
                sourceKind: "rect",
                sourceIndex: 1,
                sortKey: 2,
                kind: "rect-quad",
            },
            {
                layerId: "ui",
                layerOrder: 1,
                sourceKind: "rect",
                sourceIndex: 2,
                sortKey: 3,
                kind: "rect-quad",
            },
            {
                layerId: "ui",
                layerOrder: 1,
                sourceKind: "rect",
                sourceIndex: 3,
                sortKey: 4,
                kind: "rect-quad",
            },
            {
                layerId: "ui",
                layerOrder: 1,
                sourceKind: "sprite",
                sourceIndex: 4,
                sortKey: 5,
                kind: "rect-quad",
            },
            {
                layerId: "ui",
                layerOrder: 1,
                sourceKind: "text",
                sourceIndex: 5,
                sortKey: 6,
                kind: "glyph-quad",
            },
            {
                layerId: "ui",
                layerOrder: 1,
                sourceKind: "text",
                sourceIndex: 5,
                sortKey: 6,
                kind: "glyph-quad",
            },
        ]);

        expect(
            batches.map((batch) => ({
                layerId: batch.layerId,
                pipelineFamily: batch.pipelineFamily,
                vertexLayout: batch.vertexLayout,
                blendMode: batch.blendMode,
                resourceId: batch.resourceId,
                containsText: batch.containsText,
                itemStart: batch.itemStart,
                itemCount: batch.itemCount,
                vertexCount: batch.vertexCount,
            })),
        ).toEqual([
            {
                layerId: "world",
                pipelineFamily: "solid-2d",
                vertexLayout: "position-color-2d",
                blendMode: "opaque",
                resourceId: undefined,
                containsText: false,
                itemStart: 0,
                itemCount: 5,
                vertexCount: 162,
            },
            {
                layerId: "ui",
                pipelineFamily: "solid-2d",
                vertexLayout: "position-color-2d",
                blendMode: "opaque",
                resourceId: "solid.a",
                containsText: false,
                itemStart: 5,
                itemCount: 2,
                vertexCount: 12,
            },
            {
                layerId: "ui",
                pipelineFamily: "solid-2d",
                vertexLayout: "position-color-2d",
                blendMode: "opaque",
                resourceId: "solid.b",
                containsText: false,
                itemStart: 7,
                itemCount: 1,
                vertexCount: 6,
            },
            {
                layerId: "ui",
                pipelineFamily: "solid-2d",
                vertexLayout: "position-color-2d",
                blendMode: "alpha",
                resourceId: undefined,
                containsText: false,
                itemStart: 8,
                itemCount: 1,
                vertexCount: 6,
            },
            {
                layerId: "ui",
                pipelineFamily: "textured-2d",
                vertexLayout: "position-uv-tint-2d",
                blendMode: "opaque",
                resourceId: "sprite.a",
                containsText: false,
                itemStart: 9,
                itemCount: 1,
                vertexCount: 6,
            },
            {
                layerId: "ui",
                pipelineFamily: "textured-2d",
                vertexLayout: "position-uv-tint-2d",
                blendMode: "alpha",
                resourceId: "font.ui.page.main",
                containsText: true,
                itemStart: 10,
                itemCount: 1,
                vertexCount: 6,
            },
            {
                layerId: "ui",
                pipelineFamily: "textured-2d",
                vertexLayout: "position-uv-tint-2d",
                blendMode: "alpha",
                resourceId: "font.ui.page.accent",
                containsText: true,
                itemStart: 11,
                itemCount: 1,
                vertexCount: 6,
            },
        ]);

        expect(commands[4].geometry).toEqual({
            kind: "polygon",
            localGeometryKey: "0,0|10,0|10,5|0,5",
            vertices: [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 10, y: 5 },
                { x: 0, y: 5 },
            ],
        });
        expect(
            commands.slice(10).map((command) => command.geometry),
        ).toEqual([
            expect.objectContaining({
                kind: "glyph-quad",
                glyphIndex: 0,
                resourceId: "font.ui.page.main",
                x: 0,
                y: 0,
                w: 8,
                h: 10,
            }),
            expect.objectContaining({
                kind: "glyph-quad",
                glyphIndex: 1,
                resourceId: "font.ui.page.accent",
                x: 9,
                y: 2,
                w: 6,
                h: 9,
            }),
        ]);
        expect(frame.stats).toMatchObject({
            passCount: 2,
            commandCount: 12,
            batchCount: 7,
            vertexCount: 204,
            textItemCount: 2,
            preparedGlyphCount: 2,
            glyphVertexCount: 12,
            missingFontCount: 1,
            missingGlyphCount: 1,
            textBatchCount: 2,
        });
    });

    it("preserves debug alpha validation before handoff creation", () => {
        const prepare = createRender2DPrepare({ debug: true });

        expect(() =>
            prepare.prepare({
                target: { w: 10, h: 10, dpr: 1 },
                alpha: Number.NaN,
                layers: [],
            }),
        ).toThrow(
            "Render2DPrepare.prepare: alpha must be a finite number between 0 and 1",
        );
    });
});
