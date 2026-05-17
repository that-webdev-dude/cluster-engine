import { describe, expect, it } from "vitest";
import type {
    RenderBitmapFontConfig,
    RenderFrameInput,
} from "../service/Render.types";
import { createFontRegistry } from "./FontRegistry.module";
import { createRender2DPrepare } from "./Render2DPrepare.module";
import { createRender2DGeometryUpload } from "./Render2DGeometryUpload.module";
import type { Render2DGeometryUploadFrame } from "./Render2DGeometryUpload.module";
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

function snapshotUpload(uploadFrame: Render2DGeometryUploadFrame) {
    return {
        layouts: uploadFrame.layouts.map((upload) => ({
            layout: upload.layout,
            floatLength: upload.floatLength,
            byteLength: upload.byteLength,
            capacityFloats: upload.capacityFloats,
            data: Array.from(upload.data.slice(0, upload.floatLength)),
            ranges: upload.ranges.map((range) => ({ ...range })),
        })),
        ranges: uploadFrame.ranges.map((range) => ({ ...range })),
        rangesByBatchIndex: Array.from(uploadFrame.rangesByBatchIndex).map(
            (range) => (range ? { ...range } : undefined),
        ),
        stats: { ...uploadFrame.stats },
    };
}

describe("createRender2DGeometryUpload", () => {
    it("reports zero upload stats for an empty frame", () => {
        const frame = createRender2DPrepare().prepare(createInput([]));
        const uploadFrame = createRender2DGeometryUpload().build(frame);

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
        const uploadFrame = createRender2DGeometryUpload().build(frame);

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
        const uploadFrame = createRender2DGeometryUpload().build(frame);

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

    it("does not plan final vertex uploads for supported 2D primitives", () => {
        const frame = createTextPrepare().prepare(
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
                    y: 0,
                    w: 10,
                    h: 10,
                    resourceId: "sprite.a",
                },
                {
                    kind: "line",
                    sortKey: 2,
                    startX: 0,
                    startY: 0,
                    endX: 10,
                    endY: 10,
                },
                {
                    kind: "circle",
                    sortKey: 3,
                    x: 30,
                    y: 10,
                    radius: 5,
                },
                {
                    kind: "polygon",
                    sortKey: 4,
                    x: 40,
                    y: 10,
                    vertices: [
                        { x: 0, y: 0 },
                        { x: 10, y: 0 },
                        { x: 0, y: 10 },
                    ],
                },
                {
                    kind: "text",
                    sortKey: 5,
                    x: 50,
                    y: 10,
                    text: "A",
                    fontId: "font.ui",
                },
            ]),
        );
        const uploadFrame = createRender2DGeometryUpload().build(frame);

        expect(uploadFrame.ranges).toHaveLength(6);
        expect(new Set(uploadFrame.ranges.map((range) => range.kind))).toEqual(
            new Set(["instances"]),
        );
        expect(uploadFrame.layouts.map((upload) => upload.layout)).toEqual([
            "quad-solid-instance-2d",
            "quad-textured-instance-2d",
            "line-solid-instance-2d",
            "circle-solid-instance-2d",
            "polygon-solid-instance-2d",
        ]);
    });

    it("uses fewer upload bytes for repeated quads and glyphs than final vertex streams", () => {
        const quads = createRender2DPrepare().prepare(
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
                    y: 0,
                    w: 10,
                    h: 10,
                },
            ]),
        );
        const glyphs = createTextPrepare().prepare(
            createInput([
                {
                    kind: "text",
                    sortKey: 0,
                    x: 0,
                    y: 0,
                    text: "AA",
                    fontId: "font.ui",
                },
            ]),
        );

        const quadUpload = createRender2DGeometryUpload().build(quads);
        const glyphUpload = createRender2DGeometryUpload().build(glyphs);

        expect(quadUpload.stats.uploadByteLength).toBeLessThan(2 * 6 * 6 * 4);
        expect(glyphUpload.stats.uploadByteLength).toBeLessThan(2 * 6 * 8 * 4);
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
        const uploadFrame = createRender2DGeometryUpload().build(frame);

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
        const uploadFrame = createRender2DGeometryUpload().build(frame);

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
        const uploadFrame = createRender2DGeometryUpload().build(frame);

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
        const uploadFrame = createRender2DGeometryUpload().build(frame);

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

    it("reuses upload arenas while hiding stale ranges after large, small, and empty frames", () => {
        const prepare = createTextPrepare();
        const upload = createRender2DGeometryUpload();
        const largeFrame = prepare.prepare(
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
                    x: 12,
                    y: 0,
                    w: 10,
                    h: 10,
                    resourceId: "sprite.a",
                },
                {
                    kind: "line",
                    sortKey: 2,
                    startX: 0,
                    startY: 0,
                    endX: 10,
                    endY: 5,
                },
                {
                    kind: "circle",
                    sortKey: 3,
                    x: 24,
                    y: 0,
                    radius: 6,
                },
                {
                    kind: "ellipse",
                    sortKey: 4,
                    x: 36,
                    y: 0,
                    radiusX: 8,
                    radiusY: 4,
                },
                {
                    kind: "polygon",
                    sortKey: 5,
                    x: 48,
                    y: 0,
                    vertices: [
                        { x: 0, y: 0 },
                        { x: 8, y: 0 },
                        { x: 4, y: 6 },
                    ],
                },
                {
                    kind: "text",
                    sortKey: 6,
                    x: 60,
                    y: 0,
                    text: "AB",
                    fontId: "font.ui",
                },
            ]),
        );
        const largeUpload = upload.build(largeFrame);
        const largeSnapshot = snapshotUpload(largeUpload);
        const solidCapacity = largeUpload.layouts.find(
            (layout) => layout.layout === "quad-solid-instance-2d",
        )?.capacityFloats;

        const emptyFrame = prepare.prepare(createInput([]));
        const emptyUpload = upload.build(emptyFrame);

        expect(emptyUpload).toBe(largeUpload);
        expect(emptyUpload.layouts).toHaveLength(0);
        expect(emptyUpload.ranges).toHaveLength(0);
        expect(emptyUpload.rangesByBatchIndex).toHaveLength(0);
        expect(emptyUpload.stats).toEqual({
            layoutUploadCount: 0,
            rangeCount: 0,
            uploadByteLength: 0,
            uploadFloatLength: 0,
        });

        const smallFrame = prepare.prepare(
            createInput([
                {
                    kind: "rect",
                    sortKey: 0,
                    x: 1,
                    y: 2,
                    w: 3,
                    h: 4,
                },
            ]),
        );
        const smallUpload = upload.build(smallFrame);

        expect(smallUpload.ranges).toHaveLength(1);
        expect(smallUpload.layouts).toHaveLength(1);
        expect(smallUpload.rangesByBatchIndex).toHaveLength(1);
        expect(smallUpload.rangesByBatchIndex[0]).toBe(smallUpload.ranges[0]);
        expect(smallUpload.ranges[0]).toMatchObject({
            layout: "quad-solid-instance-2d",
            itemStart: 0,
            itemCount: 1,
            floatOffset: 0,
            floatLength: 24,
            staticGeometryKey: undefined,
        });
        expect(smallUpload.layouts[0].ranges).toEqual(smallUpload.ranges);
        expect(smallUpload.layouts[0].capacityFloats).toBeGreaterThanOrEqual(
            solidCapacity ?? 0,
        );
        expect(largeSnapshot.ranges.length).toBeGreaterThan(
            smallUpload.ranges.length,
        );
    });

    it("keeps reused range records fresh across mixed layout kinds and polygon keys", () => {
        const prepare = createRender2DPrepare();
        const upload = createRender2DGeometryUpload();
        const polygonFrame = prepare.prepare(
            createInput([
                {
                    kind: "polygon",
                    sortKey: 0,
                    x: 0,
                    y: 0,
                    vertices: [
                        { x: 0, y: 0 },
                        { x: 10, y: 0 },
                        { x: 0, y: 10 },
                    ],
                },
                {
                    kind: "polygon",
                    sortKey: 1,
                    x: 20,
                    y: 0,
                    vertices: [
                        { x: 0, y: 0 },
                        { x: 20, y: 0 },
                        { x: 0, y: 10 },
                    ],
                },
            ]),
        );
        const polygonUpload = upload.build(polygonFrame);
        const firstRangeRecord = polygonUpload.ranges[0];

        expect(polygonUpload.ranges.map((range) => range.staticGeometryKey)).toEqual(
            ["0,0|10,0|0,10", "0,0|20,0|0,10"],
        );

        const mixedFrame = prepare.prepare(
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
                    x: 10,
                    y: 10,
                    radius: 4,
                },
                {
                    kind: "line",
                    sortKey: 2,
                    startX: 0,
                    startY: 0,
                    endX: 2,
                    endY: 2,
                },
            ]),
        );
        const mixedUpload = upload.build(mixedFrame);

        expect(mixedUpload.ranges[0]).toBe(firstRangeRecord);
        expect(mixedUpload.ranges.map((range) => range.layout)).toEqual([
            "quad-solid-instance-2d",
            "circle-solid-instance-2d",
            "line-solid-instance-2d",
        ]);
        expect(mixedUpload.ranges.map((range) => range.staticGeometryKey)).toEqual(
            [undefined, undefined, undefined],
        );
        expect(mixedUpload.ranges.map((range) => range.itemStart)).toEqual([0, 1, 2]);
        expect(mixedUpload.rangesByBatchIndex[0]).toBe(mixedUpload.ranges[0]);
        expect(mixedUpload.rangesByBatchIndex).toHaveLength(mixedFrame.batchCount);
        expect(mixedUpload.stats).toEqual({
            layoutUploadCount: 3,
            rangeCount: 3,
            uploadByteLength: 232,
            uploadFloatLength: 58,
        });
    });

    it("preserves packed floats and upload tables across repeated mixed builds", () => {
        const prepare = createTextPrepare();
        const upload = createRender2DGeometryUpload();
        const input = createInput([
            {
                kind: "rect",
                sortKey: 0,
                x: 1,
                y: 2,
                prevX: 0,
                prevY: 1,
                w: 10,
                h: 12,
                color: { r: 0.2, g: 0.3, b: 0.4 },
            },
            {
                kind: "sprite",
                sortKey: 1,
                x: 3,
                y: 4,
                w: 8,
                h: 9,
                resourceId: "sprite.a",
                uv: { u: 0.1, v: 0.2, w: 0.3, h: 0.4 },
            },
            {
                kind: "text",
                sortKey: 2,
                x: 5,
                y: 6,
                text: "AB",
                fontId: "font.ui",
            },
            {
                kind: "line",
                sortKey: 3,
                startX: 1,
                startY: 2,
                endX: 3,
                endY: 4,
                strokeWidth: 2,
            },
            {
                kind: "circle",
                sortKey: 4,
                x: 6,
                y: 7,
                radius: 5,
            },
            {
                kind: "ellipse",
                sortKey: 5,
                x: 8,
                y: 9,
                radiusX: 6,
                radiusY: 3,
            },
            {
                kind: "polygon",
                sortKey: 6,
                x: 10,
                y: 11,
                vertices: [
                    { x: 0, y: 0 },
                    { x: 4, y: 0 },
                    { x: 4, y: 4 },
                    { x: 0, y: 4 },
                ],
            },
        ]);

        const first = snapshotUpload(upload.build(prepare.prepare(input)));
        upload.build(prepare.prepare(createInput([])));
        const second = snapshotUpload(upload.build(prepare.prepare(input)));

        expect(second).toEqual(first);
        expect(second.layouts.map((layout) => layout.layout)).toEqual([
            "quad-solid-instance-2d",
            "quad-textured-instance-2d",
            "line-solid-instance-2d",
            "circle-solid-instance-2d",
            "polygon-solid-instance-2d",
        ]);
        expect(second.stats).toEqual({
            layoutUploadCount: 5,
            rangeCount: 7,
            uploadByteLength: 736,
            uploadFloatLength: 184,
        });
    });

    it("reuses and grows layout typed-array capacity without stale upload stats", () => {
        const prepare = createRender2DPrepare();
        const upload = createRender2DGeometryUpload();
        const oneRectInput = createInput([
            {
                kind: "rect",
                sortKey: 0,
                x: 0,
                y: 0,
                w: 10,
                h: 10,
            },
        ]);
        const first = upload.build(prepare.prepare(oneRectInput));
        const firstData = first.layouts[0].data;
        const firstCapacity = first.layouts[0].capacityFloats;

        const fourRects = prepare.prepare(
            createInput(
                Array.from({ length: 4 }, (_, index) => ({
                    kind: "rect" as const,
                    sortKey: index,
                    x: index,
                    y: index,
                    w: 10,
                    h: 10,
                })),
            ),
        );
        const grown = upload.build(fourRects);
        const grownData = grown.layouts[0].data;
        const grownCapacity = grown.layouts[0].capacityFloats;

        expect(grownCapacity).toBeGreaterThan(firstCapacity);
        expect(grownData).not.toBe(firstData);
        expect(grown.stats).toEqual({
            layoutUploadCount: 1,
            rangeCount: 1,
            uploadByteLength: 384,
            uploadFloatLength: 96,
        });

        const smallAgain = upload.build(prepare.prepare(oneRectInput));

        expect(smallAgain.layouts[0].data).toBe(grownData);
        expect(smallAgain.layouts[0].capacityFloats).toBe(grownCapacity);
        expect(smallAgain.layouts[0].floatLength).toBe(24);
        expect(smallAgain.stats).toEqual({
            layoutUploadCount: 1,
            rangeCount: 1,
            uploadByteLength: 96,
            uploadFloatLength: 24,
        });
    });
});
