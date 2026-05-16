import { describe, expect, it } from "vitest";
import type { RenderFrameInput } from "../service/Render.types";
import { createRender2DPrepare } from "./Render2DPrepare.module";
import { createRender2DUpload } from "./Render2DUpload.module";

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

    it("splits mixed quad and unsupported primitive batches into instance and legacy ranges", () => {
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
            "position-color-2d",
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
                kind: "vertices",
                batchIndex: 0,
                itemStart: 1,
                itemCount: 1,
                byteLength: 1728,
                vertexCount: 72,
                instanceCount: 0,
            },
        ]);
        expect(uploadFrame.stats).toEqual({
            layoutUploadCount: 2,
            rangeCount: 2,
            uploadByteLength: 1824,
            uploadFloatLength: 456,
        });
    });
});
