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

    it("packs multiple same-layout batches into one layout upload", () => {
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
        expect(uploadFrame.stats).toEqual({
            layoutUploadCount: 1,
            rangeCount: 2,
            uploadByteLength: 288,
            uploadFloatLength: 72,
        });
        expect(uploadFrame.rangesByBatchIndex[1]).toMatchObject({
            byteOffset: 144,
            byteLength: 144,
            vertexCount: 6,
        });
    });

    it("reports separate layout uploads for mixed solid and textured batches", () => {
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
            "position-color-2d",
            "position-uv-tint-2d",
        ]);
        expect(uploadFrame.stats).toEqual({
            layoutUploadCount: 2,
            rangeCount: 3,
            uploadByteLength: 480,
            uploadFloatLength: 120,
        });
    });
});
