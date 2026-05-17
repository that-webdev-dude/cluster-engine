import { describe, expect, it } from "vitest";
import type {
    RenderBitmapFontConfig,
    RenderFrameInput,
} from "../service/Render.types";
import { createFontRegistry } from "./FontRegistry.module";
import { createRender2DPrepare } from "./Render2DPrepare.module";
import { createRender2DUpload } from "./Render2DUpload.module";
import { createTextLayout } from "./TextLayout.module";

function createInput(items: RenderFrameInput["layers"][number]["items"]) {
    return {
        target: { w: 100, h: 100, dpr: 1 },
        alpha: 1,
        layers: [
            {
                id: "main",
                order: 0,
                items,
            },
        ],
    } satisfies RenderFrameInput;
}

function createTwoPageFont(): RenderBitmapFontConfig {
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
                width: 32,
                height: 16,
            },
            {
                id: "accent",
                resourceId: "font.ui.page.accent",
                width: 32,
                height: 16,
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
                w: 8,
                h: 10,
                xOffset: 1,
                yOffset: 0,
                xAdvance: 8,
            },
        ],
    };
}

function createTextPrepare() {
    const registry = createFontRegistry({ debug: true });
    registry.register([createTwoPageFont()]);
    return createRender2DPrepare({
        fontRegistry: registry,
        textLayout: createTextLayout(),
    });
}

describe("createRender2DUpload", () => {
    it("reports zero upload stats for an empty frame", () => {
        const frame = createRender2DPrepare().prepare(createInput([]));
        const uploadFrame = createRender2DUpload().build(frame);

        expect(uploadFrame.layouts).toHaveLength(0);
        expect(uploadFrame.stats).toEqual({
            layoutUploadCount: 0,
            rangeCount: 0,
            uploadByteLength: 0,
            uploadFloatLength: 0,
        });
    });

    it("packs multiple same-layout quad instance batches into one layout upload", () => {
        const frame = createRender2DPrepare().prepare(
            createInput([
                {
                    kind: "rect",
                    sortKey: 0,
                    x: 0,
                    y: 0,
                    w: 10,
                    h: 10,
                },
                {
                    kind: "rect",
                    sortKey: 1,
                    x: 20,
                    y: 20,
                    w: 10,
                    h: 10,
                    blend: "alpha",
                },
            ]),
        );
        const uploadFrame = createRender2DUpload().build(frame);

        expect(uploadFrame.layouts).toHaveLength(1);
        expect(uploadFrame.layouts[0].layout).toBe("quad-solid-instance-2d");
        expect(uploadFrame.ranges.map((range) => range.kind)).toEqual([
            "instances",
            "instances",
        ]);
        expect(uploadFrame.stats).toEqual({
            layoutUploadCount: 1,
            rangeCount: 2,
            uploadByteLength: 192,
            uploadFloatLength: 48,
        });
        expect(uploadFrame.rangesByBatchIndex[1]).toMatchObject({
            byteOffset: 96,
            byteLength: 96,
            vertexCount: 6,
            instanceCount: 1,
        });
    });

    it("reports separate instance layout uploads for mixed solid and textured batches", () => {
        const frame = createRender2DPrepare().prepare(
            createInput([
                {
                    kind: "rect",
                    sortKey: 0,
                    x: 0,
                    y: 0,
                    w: 10,
                    h: 10,
                },
                {
                    kind: "sprite",
                    sortKey: 1,
                    x: 20,
                    y: 20,
                    w: 10,
                    h: 10,
                    resourceId: "sprite.a",
                },
                {
                    kind: "rect",
                    sortKey: 2,
                    x: 40,
                    y: 40,
                    w: 10,
                    h: 10,
                    blend: "alpha",
                },
            ]),
        );
        const uploadFrame = createRender2DUpload().build(frame);

        expect(uploadFrame.layouts.map((upload) => upload.layout)).toEqual([
            "quad-solid-instance-2d",
            "quad-textured-instance-2d",
        ]);
        expect(uploadFrame.ranges.map((range) => range.kind)).toEqual([
            "instances",
            "instances",
            "instances",
        ]);
        expect(uploadFrame.stats).toEqual({
            layoutUploadCount: 2,
            rangeCount: 3,
            uploadByteLength: 304,
            uploadFloatLength: 76,
        });
    });

    it("splits mixed quad and circle batches into separate instance ranges", () => {
        const frame = createRender2DPrepare().prepare(
            createInput([
                {
                    kind: "rect",
                    sortKey: 0,
                    x: 0,
                    y: 0,
                    w: 10,
                    h: 10,
                },
                {
                    kind: "circle",
                    sortKey: 1,
                    x: 20,
                    y: 20,
                    radius: 5,
                },
            ]),
        );
        const uploadFrame = createRender2DUpload().build(frame);

        expect(frame.batchCount).toBe(1);
        expect(uploadFrame.layouts.map((upload) => upload.layout)).toEqual([
            "quad-solid-instance-2d",
            "circle-solid-instance-2d",
        ]);
        expect(uploadFrame.ranges).toMatchObject([
            {
                kind: "instances",
                batchIndex: 0,
                itemStart: 0,
                itemCount: 1,
                byteLength: 96,
                vertexCount: 6,
                instanceCount: 1,
            },
            {
                kind: "instances",
                batchIndex: 0,
                itemStart: 1,
                itemCount: 1,
                byteLength: 88,
                vertexCount: 72,
                instanceCount: 1,
            },
        ]);
        expect(uploadFrame.stats).toEqual({
            layoutUploadCount: 2,
            rangeCount: 2,
            uploadByteLength: 184,
            uploadFloatLength: 46,
        });
    });

    it("packs line instances and skips degenerate lines", () => {
        const frame = createRender2DPrepare().prepare(
            createInput([
                {
                    kind: "line",
                    sortKey: 0,
                    startX: 1,
                    startY: 2,
                    endX: 11,
                    endY: 12,
                    strokeWidth: 3,
                    color: { r: 0.25, g: 0.5, b: 0.75 },
                },
                {
                    kind: "line",
                    sortKey: 1,
                    startX: 5,
                    startY: 5,
                    endX: 5,
                    endY: 5,
                },
            ]),
        );
        const uploadFrame = createRender2DUpload().build(frame);

        expect(frame.itemCount).toBe(1);
        expect(uploadFrame.layouts[0].layout).toBe("line-solid-instance-2d");
        expect(uploadFrame.ranges[0]).toMatchObject({
            kind: "instances",
            vertexCount: 6,
            instanceCount: 1,
            byteLength: 48,
        });
        expect(Array.from(uploadFrame.layouts[0].data.slice(0, 12))).toEqual([
            1, 2, 11, 12, 3, 0, 0, 0, 0.25, 0.5, 0.75, 1,
        ]);
    });

    it("uses polygon local geometry keys to split cacheable instance ranges", () => {
        const firstVertices = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
        ];
        const secondVertices = [
            { x: 0, y: 0 },
            { x: 20, y: 0 },
            { x: 10, y: 10 },
        ];
        const frame = createRender2DPrepare().prepare(
            createInput([
                {
                    kind: "polygon",
                    sortKey: 0,
                    x: 0,
                    y: 0,
                    vertices: firstVertices,
                },
                {
                    kind: "polygon",
                    sortKey: 1,
                    x: 20,
                    y: 0,
                    vertices: firstVertices,
                },
                {
                    kind: "polygon",
                    sortKey: 2,
                    x: 40,
                    y: 0,
                    vertices: secondVertices,
                },
            ]),
        );
        const uploadFrame = createRender2DUpload().build(frame);

        expect(uploadFrame.layouts[0].layout).toBe("polygon-solid-instance-2d");
        expect(uploadFrame.ranges).toMatchObject([
            {
                kind: "instances",
                itemStart: 0,
                itemCount: 2,
                instanceCount: 2,
                staticGeometryKey: "0,0|10,0|10,10",
            },
            {
                kind: "instances",
                itemStart: 2,
                itemCount: 1,
                instanceCount: 1,
                staticGeometryKey: "0,0|20,0|10,10",
            },
        ]);
    });

    it("packs glyph instances into atlas-page grouped textured ranges", () => {
        const frame = createTextPrepare().prepare(
            createInput([
                {
                    kind: "text",
                    sortKey: 0,
                    x: 10,
                    y: 20,
                    prevX: 5,
                    prevY: 15,
                    text: "AB",
                    fontId: "font.ui",
                },
            ]),
        );
        const uploadFrame = createRender2DUpload().build(frame);

        expect(frame.batches.map((batch) => batch.resourceId)).toEqual([
            "font.ui.page.main",
            "font.ui.page.accent",
        ]);
        expect(uploadFrame.layouts).toHaveLength(1);
        expect(uploadFrame.layouts[0].layout).toBe("quad-textured-instance-2d");
        expect(uploadFrame.ranges).toMatchObject([
            {
                kind: "instances",
                batchIndex: 0,
                itemStart: 0,
                itemCount: 1,
                vertexCount: 6,
                instanceCount: 1,
            },
            {
                kind: "instances",
                batchIndex: 1,
                itemStart: 1,
                itemCount: 1,
                vertexCount: 6,
                instanceCount: 1,
            },
        ]);
        expect(uploadFrame.stats).toEqual({
            layoutUploadCount: 1,
            rangeCount: 2,
            uploadByteLength: 224,
            uploadFloatLength: 56,
        });
        expect(Array.from(uploadFrame.layouts[0].data.slice(0, 28))).toEqual([
            10, 20, 5, 15, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 8, 10, 0, 0,
            0.25, 0.625, 1, 1, 1, 1, 1, 0,
        ]);
        expect(Array.from(uploadFrame.layouts[0].data.slice(28, 56))).toEqual([
            10, 20, 5, 15, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 9, 0, 8, 10, 0.25,
            0, 0.25, 0.625, 1, 1, 1, 1, 1, 0,
        ]);
    });
});
