import { describe, expect, it } from "vitest";
import {
    createRenderExtractionAdapter,
    extractRenderFrameInput,
    type RenderExtractionQueryRow,
    type RenderExtractionWorldReader,
} from "./RenderExtraction.module";
import type { RenderFrameInput } from "../../services/render";

type ComponentFields = Record<string, Record<string, unknown>>;

function createRow(
    entityId: string,
    components: ComponentFields,
): RenderExtractionQueryRow {
    const boundComponents: Record<
        string,
        Record<string, { read(): unknown }>
    > = Object.create(null);

    for (const [componentName, fields] of Object.entries(components)) {
        const boundFields: Record<string, { read(): unknown }> =
            Object.create(null);

        for (const [fieldName, value] of Object.entries(fields)) {
            boundFields[fieldName] = {
                read() {
                    return value;
                },
            };
        }

        boundComponents[componentName] = boundFields;
    }

    return {
        entityId,
        storeId: "leaked.store",
        archetypeId: "leaked.archetype",
        components: boundComponents,
    } as RenderExtractionQueryRow;
}

function createWorldReader(
    rowsByStoreId: ReadonlyMap<string, readonly RenderExtractionQueryRow[]>,
): RenderExtractionWorldReader {
    return {
        query(storeId, componentNames) {
            const rows = rowsByStoreId.get(storeId) ?? [];

            return rows.filter((row) =>
                componentNames.every(
                    (componentName) => row.components[componentName],
                ),
            );
        },
    };
}

function createMutableWorldReader(
    rowsByStoreId: ReadonlyMap<string, readonly RenderExtractionQueryRow[]>,
): RenderExtractionWorldReader & {
    setRows(rows: ReadonlyMap<string, readonly RenderExtractionQueryRow[]>): void;
} {
    let currentRowsByStoreId = rowsByStoreId;

    return {
        setRows(rows) {
            currentRowsByStoreId = rows;
        },
        query(storeId, componentNames) {
            const rows = currentRowsByStoreId.get(storeId) ?? [];

            return rows.filter((row) =>
                componentNames.every(
                    (componentName) => row.components[componentName],
                ),
            );
        },
    };
}

function extract(
    rowsByStoreId: ReadonlyMap<string, readonly RenderExtractionQueryRow[]>,
    storeIds: readonly string[] = ["store.a"],
    debug = false,
): RenderFrameInput {
    return extractRenderFrameInput({
        alpha: 0.5,
        target: { w: 320, h: 240, dpr: 2 },
        storeIds,
        world: createWorldReader(rowsByStoreId),
        debug,
    });
}

function createRectRows(count: number, offset = 0): readonly RenderExtractionQueryRow[] {
    return Array.from({ length: count }, (_, index) =>
        createRow(`entity.${offset + index}`, {
            position: { x: offset + index, y: offset + index + 1 },
            prevPosition: { x: offset + index - 1, y: offset + index - 2 },
            size: { w: 10 + index, h: 20 + index },
            color: {
                r: index / Math.max(count, 1),
                g: 0.5,
                b: 0.75,
            },
        }),
    );
}

function getFirstRect(input: RenderFrameInput) {
    return input.layers[0].items[0];
}

function getRectXs(input: RenderFrameInput, layerIndex: number): readonly number[] {
    return input.layers[layerIndex].items.map((item) => {
        expect(item.kind).toBe("rect");
        return item.kind === "rect" ? item.x : Number.NaN;
    });
}

describe("extractRenderFrameInput", () => {
    it("extracts position and size rows into renderer-domain rects", () => {
        const frame = extract(
            new Map([
                [
                    "store.a",
                    [
                        createRow("entity.a", {
                            position: { x: 10, y: 20 },
                            size: { w: 30, h: 40 },
                        }),
                    ],
                ],
            ]),
        );

        expect(frame).toMatchObject({
            alpha: 0.5,
            target: { w: 320, h: 240, dpr: 2 },
            layers: [
                {
                    id: "game.layer.0",
                    order: 0,
                    items: [
                        {
                            kind: "rect",
                            sortKey: 0,
                            x: 10,
                            y: 20,
                            prevX: 10,
                            prevY: 20,
                            w: 30,
                            h: 40,
                        },
                    ],
                },
            ],
        });
    });

    it("joins optional previous position by entity id", () => {
        const frame = extract(
            new Map([
                [
                    "store.a",
                    [
                        createRow("entity.a", {
                            position: { x: 10, y: 20 },
                            prevPosition: { x: 1, y: 2 },
                            size: { w: 30, h: 40 },
                        }),
                    ],
                ],
            ]),
        );

        expect(getFirstRect(frame)).toMatchObject({
            prevX: 1,
            prevY: 2,
        });
    });

    it("falls back to current position when previous position is missing", () => {
        const frame = extract(
            new Map([
                [
                    "store.a",
                    [
                        createRow("entity.a", {
                            position: { x: 10, y: 20 },
                            size: { w: 30, h: 40 },
                        }),
                    ],
                ],
            ]),
        );

        expect(getFirstRect(frame)).toMatchObject({
            prevX: 10,
            prevY: 20,
        });
    });

    it("joins optional color by entity id", () => {
        const frame = extract(
            new Map([
                [
                    "store.a",
                    [
                        createRow("entity.a", {
                            position: { x: 10, y: 20 },
                            size: { w: 30, h: 40 },
                            color: { r: 0.25, g: 0.5, b: 0.75 },
                        }),
                    ],
                ],
            ]),
        );

        expect(getFirstRect(frame)).toMatchObject({
            color: { r: 0.25, g: 0.5, b: 0.75 },
        });
    });

    it("preserves active store order as renderer layer order", () => {
        const frame = extract(
            new Map([
                [
                    "store.a",
                    [
                        createRow("entity.a", {
                            position: { x: 10, y: 20 },
                            size: { w: 30, h: 40 },
                        }),
                    ],
                ],
                [
                    "store.b",
                    [
                        createRow("entity.b", {
                            position: { x: 50, y: 60 },
                            size: { w: 70, h: 80 },
                        }),
                    ],
                ],
            ]),
            ["store.b", "store.a"],
        );

        expect(
            frame.layers.map((layer) => ({
                id: layer.id,
                order: layer.order,
                item: layer.items[0],
            })),
        ).toEqual([
            {
                id: "game.layer.0",
                order: 0,
                item: expect.objectContaining({ kind: "rect", x: 50 }),
            },
            {
                id: "game.layer.1",
                order: 1,
                item: expect.objectContaining({ kind: "rect", x: 10 }),
            },
        ]);
    });

    it("preserves multi-store layer order and per-store sort keys", () => {
        const frame = extract(
            new Map([
                [
                    "store.a",
                    [
                        createRow("entity.a0", {
                            position: { x: 10, y: 20 },
                            size: { w: 30, h: 40 },
                        }),
                        createRow("entity.a1", {
                            position: { x: 11, y: 21 },
                            size: { w: 31, h: 41 },
                        }),
                    ],
                ],
                [
                    "store.b",
                    [
                        createRow("entity.b0", {
                            position: { x: 50, y: 60 },
                            size: { w: 70, h: 80 },
                        }),
                        createRow("entity.b1", {
                            position: { x: 51, y: 61 },
                            size: { w: 71, h: 81 },
                        }),
                    ],
                ],
            ]),
            ["store.b", "store.a"],
        );

        expect(frame.layers.map((layer) => layer.order)).toEqual([0, 1]);
        expect(frame.layers.map((layer) => layer.id)).toEqual([
            "game.layer.0",
            "game.layer.1",
        ]);
        expect(frame.layers[0].items.map((item) => item.sortKey)).toEqual([0, 1]);
        expect(frame.layers[1].items.map((item) => item.sortKey)).toEqual([0, 1]);
        expect(getRectXs(frame, 0)).toEqual([50, 51]);
        expect(getRectXs(frame, 1)).toEqual([10, 11]);
    });

    it("keeps repeated extraction safe from large-to-small and small-to-empty stale items", () => {
        const world = createMutableWorldReader(
            new Map([["store.a", createRectRows(8)]]),
        );
        const adapter = createRenderExtractionAdapter();
        const input = {
            alpha: 0.5,
            target: { w: 320, h: 240, dpr: 2 },
            storeIds: ["store.a"],
            world,
        };

        const largeFrame = adapter.extract(input);
        expect(largeFrame.layers[0].items).toHaveLength(8);
        expect(largeFrame.layers[0].items.at(-1)).toMatchObject({
            x: 7,
            y: 8,
        });

        world.setRows(new Map([["store.a", createRectRows(2, 100)]]));
        const smallFrame = adapter.extract(input);
        expect(smallFrame.layers).toHaveLength(1);
        expect(smallFrame.layers[0].items).toHaveLength(2);
        expect(getRectXs(smallFrame, 0)).toEqual([100, 101]);

        world.setRows(new Map([["store.a", []]]));
        const emptyFrame = adapter.extract(input);
        expect(emptyFrame.layers).toHaveLength(1);
        expect(emptyFrame.layers[0].items).toEqual([]);
    });

    it("does not keep stale layers when the store count shrinks", () => {
        const world = createMutableWorldReader(
            new Map([
                ["store.a", createRectRows(1, 10)],
                ["store.b", createRectRows(1, 20)],
                ["store.c", createRectRows(1, 30)],
            ]),
        );
        const adapter = createRenderExtractionAdapter();
        const target = { w: 320, h: 240, dpr: 2 };

        const threeStores = adapter.extract({
            alpha: 0.5,
            target,
            storeIds: ["store.a", "store.b", "store.c"],
            world,
        });
        expect(threeStores.layers).toHaveLength(3);

        world.setRows(new Map([["store.a", createRectRows(1, 100)]]));
        const oneStore = adapter.extract({
            alpha: 0.5,
            target,
            storeIds: ["store.a"],
            world,
        });

        expect(oneStore.layers).toHaveLength(1);
        expect(oneStore.layers[0]).toMatchObject({
            id: "game.layer.0",
            order: 0,
        });
        expect(oneStore.layers[0].items).toHaveLength(1);
        expect(oneStore.layers[0].items[0]).toMatchObject({ x: 100 });
        expect(JSON.stringify(oneStore)).not.toContain("game.layer.1");
        expect(JSON.stringify(oneStore)).not.toContain("game.layer.2");
    });

    it("refreshes optional previous position and color across repeated calls", () => {
        const world = createMutableWorldReader(
            new Map([
                [
                    "store.a",
                    [
                        createRow("entity.a", {
                            position: { x: 10, y: 20 },
                            prevPosition: { x: 1, y: 2 },
                            size: { w: 30, h: 40 },
                            color: { r: 0.1, g: 0.2, b: 0.3 },
                        }),
                    ],
                ],
            ]),
        );
        const adapter = createRenderExtractionAdapter();
        const input = {
            alpha: 0.5,
            target: { w: 320, h: 240, dpr: 2 },
            storeIds: ["store.a"],
            world,
        };

        expect(adapter.extract(input).layers[0].items[0]).toMatchObject({
            prevX: 1,
            prevY: 2,
            color: { r: 0.1, g: 0.2, b: 0.3 },
        });

        world.setRows(
            new Map([
                [
                    "store.a",
                    [
                        createRow("entity.a", {
                            position: { x: 100, y: 200 },
                            size: { w: 300, h: 400 },
                        }),
                    ],
                ],
            ]),
        );

        expect(adapter.extract(input).layers[0].items[0]).toEqual(
            expect.objectContaining({
                prevX: 100,
                prevY: 200,
                color: undefined,
            }),
        );
    });

    it("does not leak world or query metadata into render input", () => {
        const frame = extract(
            new Map([
                [
                    "store.secret",
                    [
                        createRow("entity.secret", {
                            position: { x: 10, y: 20 },
                            prevPosition: { x: 1, y: 2 },
                            size: { w: 30, h: 40 },
                            color: { r: 0.25, g: 0.5, b: 0.75 },
                        }),
                    ],
                ],
            ]),
            ["store.secret"],
        );
        const serialized = JSON.stringify(frame);

        expect(serialized).not.toContain("entity.secret");
        expect(serialized).not.toContain("store.secret");
        expect(serialized).not.toContain("leaked.store");
        expect(serialized).not.toContain("leaked.archetype");
        expect(serialized).not.toContain("components");
        expect(serialized).not.toContain("position");
        expect(serialized).not.toContain("prevPosition");
        expect(serialized).not.toContain("size");
        expect(serialized).not.toContain("debug");
        expect(frame.layers[0].id).toBe("game.layer.0");
    });

    it("skips invalid rectangle sizes in non-debug mode", () => {
        const frame = extract(
            new Map([
                [
                    "store.a",
                    [
                        createRow("entity.a", {
                            position: { x: 10, y: 20 },
                            size: { w: 0, h: 40 },
                        }),
                        createRow("entity.b", {
                            position: { x: 30, y: 40 },
                            size: { w: 50, h: 60 },
                        }),
                    ],
                ],
            ]),
        );

        expect(frame.layers[0].items).toHaveLength(1);
        expect(frame.layers[0].items[0]).toMatchObject({
            x: 30,
            y: 40,
            w: 50,
            h: 60,
        });
    });

    it("skips invalid rows in non-debug mode", () => {
        const frame = extract(
            new Map([
                [
                    "store.a",
                    [
                        createRow("entity.invalid-position", {
                            position: { x: Number.NaN, y: 20 },
                            size: { w: 30, h: 40 },
                        }),
                        createRow("entity.invalid-size", {
                            position: { x: 10, y: 20 },
                            size: { w: 30, h: -1 },
                        }),
                        createRow("entity.valid", {
                            position: { x: 90, y: 91 },
                            size: { w: 92, h: 93 },
                        }),
                    ],
                ],
            ]),
        );

        expect(frame.layers[0].items).toHaveLength(1);
        expect(frame.layers[0].items[0]).toMatchObject({
            x: 90,
            y: 91,
            w: 92,
            h: 93,
        });
    });

    it("throws loud debug errors for invalid required numeric fields", () => {
        expect(() =>
            extract(
                new Map([
                    [
                        "store.a",
                        [
                            createRow("entity.a", {
                                position: { x: "bad", y: 20 },
                                size: { w: 30, h: 40 },
                            }),
                        ],
                    ],
                ]),
                ["store.a"],
                true,
            ),
        ).toThrow(
            "RenderExtraction.extract: position.x must be a finite number",
        );

        expect(() =>
            extract(
                new Map([
                    [
                        "store.a",
                        [
                            createRow("entity.a", {
                                position: { x: 10, y: 20 },
                                size: { w: 0, h: 40 },
                            }),
                        ],
                    ],
                ]),
                ["store.a"],
                true,
            ),
        ).toThrow(
            "RenderExtraction.extract: size.w and size.h must be greater than 0",
        );
    });

    it("keeps loud debug errors consistent for invalid optional fields", () => {
        expect(() =>
            extract(
                new Map([
                    [
                        "store.a",
                        [
                            createRow("entity.a", {
                                position: { x: 10, y: 20 },
                                prevPosition: { x: "bad", y: 2 },
                                size: { w: 30, h: 40 },
                            }),
                        ],
                    ],
                ]),
                ["store.a"],
                true,
            ),
        ).toThrow(
            "RenderExtraction.extract: prevPosition.x must be a finite number",
        );

        expect(() =>
            extract(
                new Map([
                    [
                        "store.a",
                        [
                            createRow("entity.a", {
                                position: { x: 10, y: 20 },
                                size: { w: 30, h: 40 },
                                color: { r: 0.1, g: "bad", b: 0.3 },
                            }),
                        ],
                    ],
                ]),
                ["store.a"],
                true,
            ),
        ).toThrow("RenderExtraction.extract: color.g must be a finite number");
    });
});
