import { describe, expect, it } from "vitest";
import {
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

function getFirstRect(input: RenderFrameInput) {
    return input.layers[0].items[0];
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
});
