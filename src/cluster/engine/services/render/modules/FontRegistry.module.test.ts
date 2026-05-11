import { describe, expect, it } from "vitest";
import { createFontRegistry } from "./FontRegistry.module";
import type { RenderBitmapFontConfig } from "../service/Render.types";

function createFont(
    overrides: Partial<RenderBitmapFontConfig> = {},
): RenderBitmapFontConfig {
    return {
        id: "font.ui",
        kind: "bitmap",
        baseSize: 16,
        lineHeight: 20,
        baseline: 14,
        pages: [
            {
                id: "main",
                resourceId: "font.ui.page.main",
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
                xOffset: 1,
                yOffset: 2,
                xAdvance: 9,
            },
            {
                codepoint: 63,
                pageId: "main",
                x: 8,
                y: 0,
                w: 8,
                h: 10,
                xOffset: 0,
                yOffset: 1,
                xAdvance: 8,
            },
        ],
        kernings: [{ left: 65, right: 63, amount: -1 }],
        replacementCodepoint: 63,
        ...overrides,
    };
}

describe("createFontRegistry", () => {
    it("registers page-aware bitmap font metadata and computed lookups", () => {
        const registry = createFontRegistry();

        registry.register([createFont()]);

        const font = registry.get("font.ui");
        expect(font).toMatchObject({
            id: "font.ui",
            kind: "bitmap",
            baseSize: 16,
            lineHeight: 20,
            baseline: 14,
            generation: 1,
            replacementCodepoint: 63,
        });
        expect(font?.pages.get("main")).toEqual({
            id: "main",
            resourceId: "font.ui.page.main",
            width: 64,
            height: 32,
        });
        expect(font?.glyphs.get(65)).toMatchObject({
            codepoint: 65,
            pageId: "main",
            resourceId: "font.ui.page.main",
            xOffset: 1,
            yOffset: 2,
            xAdvance: 9,
            uv: { u: 0, v: 0, w: 0.125, h: 0.3125 },
        });
        expect(font?.kernings.get("65:63")).toBe(-1);
        expect(font?.glyphs.get(font.replacementCodepoint ?? -1)?.codepoint).toBe(63);
        expect(registry.getStats()).toMatchObject({
            fontResourceCount: 1,
            fontPageResourceCount: 1,
        });
    });

    it("replaces duplicate font ids and increments generation", () => {
        const registry = createFontRegistry();

        registry.register([createFont()]);
        registry.register([
            createFont({
                lineHeight: 24,
                pages: [
                    {
                        id: "main",
                        resourceId: "font.ui.page.replacement",
                        width: 128,
                        height: 64,
                    },
                ],
            }),
        ]);

        expect(registry.get("font.ui")).toMatchObject({
            generation: 2,
            lineHeight: 24,
        });
        expect(registry.get("font.ui")?.pages.get("main")?.resourceId).toBe(
            "font.ui.page.replacement",
        );
        expect(registry.getStats()).toMatchObject({
            fontResourceCount: 1,
            fontPageResourceCount: 1,
            fontReplacementRegistrationCount: 1,
        });
    });

    it("throws render-style validation errors in debug mode", () => {
        const registry = createFontRegistry({ debug: true });

        expect(() => registry.register([createFont({ id: " " })])).toThrow(
            "FontRegistry.register: font id is required",
        );
        expect(registry.getStats().invalidFontRegistrationCount).toBe(1);
    });

    it("rejects invalid page ids in debug mode", () => {
        const registry = createFontRegistry({ debug: true });

        expect(() =>
            registry.register([
                createFont({
                    pages: [
                        {
                            id: " ",
                            resourceId: "font.ui.page.main",
                            width: 64,
                            height: 32,
                        },
                    ],
                }),
            ]),
        ).toThrow('FontRegistry.register: font "font.ui" page id is required');
    });

    it("skips invalid font configs outside debug mode and records counters", () => {
        const registry = createFontRegistry();

        registry.register([
            createFont({
                pages: [
                    {
                        id: "main",
                        resourceId: "font.ui.page.main",
                        width: 0,
                        height: 32,
                    },
                ],
            }),
        ]);

        expect(registry.get("font.ui")).toBeUndefined();
        expect(registry.getStats()).toMatchObject({
            fontResourceCount: 0,
            fontPageResourceCount: 0,
            invalidFontRegistrationCount: 1,
        });
    });

    it("rejects glyphs that reference missing pages", () => {
        const registry = createFontRegistry({ debug: true });

        expect(() =>
            registry.register([
                createFont({
                    glyphs: [
                        {
                            codepoint: 65,
                            pageId: "missing",
                            x: 0,
                            y: 0,
                            w: 8,
                            h: 10,
                            xOffset: 0,
                            yOffset: 0,
                            xAdvance: 8,
                        },
                    ],
                }),
            ]),
        ).toThrow(
            'FontRegistry.register: font "font.ui" glyph 65 references unknown page "missing"',
        );
    });

    it("rejects duplicate glyph codepoints", () => {
        const registry = createFontRegistry({ debug: true });

        expect(() =>
            registry.register([
                createFont({
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
                            codepoint: 65,
                            pageId: "main",
                            x: 8,
                            y: 0,
                            w: 8,
                            h: 10,
                            xOffset: 0,
                            yOffset: 0,
                            xAdvance: 8,
                        },
                    ],
                }),
            ]),
        ).toThrow('FontRegistry.register: font "font.ui" glyph 65 is duplicated');
    });

    it("tracks missing font and missing glyph counters for future layout policy", () => {
        const registry = createFontRegistry();

        registry.recordMissingFont();
        registry.recordMissingGlyph();
        registry.recordMissingGlyph();

        expect(registry.getStats()).toMatchObject({
            missingFontCount: 1,
            missingGlyphCount: 2,
        });
    });

    it("clears font records and counters on dispose integration", () => {
        const registry = createFontRegistry();

        registry.register([createFont()]);
        registry.recordMissingGlyph();
        registry.clear();

        expect(registry.get("font.ui")).toBeUndefined();
        expect(registry.getStats()).toEqual({
            fontResourceCount: 0,
            fontPageResourceCount: 0,
            fontReplacementRegistrationCount: 0,
            invalidFontRegistrationCount: 0,
            missingFontCount: 0,
            missingGlyphCount: 0,
        });
    });
});
