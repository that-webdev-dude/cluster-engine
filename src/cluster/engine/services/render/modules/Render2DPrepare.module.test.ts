import { describe, expect, it } from "vitest";
import { createRender2DPrepare } from "./Render2DPrepare.module";
import type { RenderFrameInput } from "../service/Render.types";

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
                            kind: "rect",
                            sortKey: 2,
                            x: 0,
                            y: 0,
                            w: 1,
                            h: 1,
                        },
                    ],
                },
                {
                    id: "background",
                    order: 0,
                    items: [
                        {
                            kind: "rect",
                            sortKey: 5,
                            x: 0,
                            y: 0,
                            w: 1,
                            h: 1,
                        },
                        {
                            kind: "rect",
                            sortKey: 1,
                            x: 0,
                            y: 0,
                            w: 1,
                            h: 1,
                        },
                        {
                            kind: "rect",
                            sortKey: 1,
                            x: 0,
                            y: 0,
                            w: 1,
                            h: 1,
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
