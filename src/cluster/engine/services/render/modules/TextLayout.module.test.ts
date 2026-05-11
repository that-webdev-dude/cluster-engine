import { describe, expect, it } from "vitest";
import { createFontRegistry } from "./FontRegistry.module";
import { createTextLayout } from "./TextLayout.module";
import type { RenderBitmapFontConfig } from "../service/Render.types";
import type { RenderTextLayoutInput } from "./TextLayout.module";

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
                pageId: "main",
                x: 18,
                y: 0,
                w: 6,
                h: 8,
                xOffset: 0,
                yOffset: 1,
                xAdvance: 6,
            },
            {
                codepoint: 32,
                pageId: "main",
                x: 24,
                y: 0,
                w: 4,
                h: 4,
                xOffset: 0,
                yOffset: 0,
                xAdvance: 4,
            },
            {
                codepoint: 63,
                pageId: "main",
                x: 28,
                y: 0,
                w: 5,
                h: 8,
                xOffset: 0,
                yOffset: 0,
                xAdvance: 5,
            },
        ],
        kernings: [{ left: 65, right: 66, amount: -2 }],
        replacementCodepoint: 63,
        ...overrides,
    };
}

function createFontRecord(overrides: Partial<RenderBitmapFontConfig> = {}) {
    const config = createFont(overrides);
    const registry = createFontRegistry({ debug: true });
    registry.register([config]);
    const font = registry.get(config.id);
    if (!font) throw new Error("test font was not registered");
    return font;
}

function layoutInput(
    overrides: Partial<RenderTextLayoutInput> = {},
): RenderTextLayoutInput {
    return {
        text: "A",
        fontId: "font.ui",
        ...overrides,
    };
}

describe("createTextLayout", () => {
    it("lays out a single glyph with page resource id, local rectangle, and UVs", () => {
        const layout = createTextLayout();
        const result = layout.layout(layoutInput(), createFontRecord());

        expect(result).toMatchObject({
            width: 10,
            height: 12,
            missingFontCount: 0,
            missingGlyphCount: 0,
        });
        expect(result.glyphs).toEqual([
            {
                codepoint: 65,
                sourceCharIndex: 0,
                pageId: "main",
                resourceId: "font.ui.page.main",
                x: 0,
                y: 0,
                w: 10,
                h: 8,
                uv: { u: 0, v: 0, w: 0.1, h: 0.16 },
            },
        ]);
    });

    it("lays out multiple left-to-right glyphs with stable source indices", () => {
        const layout = createTextLayout();
        const result = layout.layout(layoutInput({ text: "ABC" }), createFontRecord());

        expect(result.glyphs.map((glyph) => glyph.codepoint)).toEqual([65, 66, 67]);
        expect(result.glyphs.map((glyph) => glyph.sourceCharIndex)).toEqual([0, 1, 2]);
        expect(result.glyphs.map((glyph) => glyph.x)).toEqual([0, 9, 16]);
        expect(result.width).toBe(22);
    });

    it("returns empty metrics for empty text", () => {
        const layout = createTextLayout();
        const result = layout.layout(layoutInput({ text: "" }), createFontRecord());

        expect(result).toEqual({
            glyphs: [],
            width: 0,
            height: 0,
            missingGlyphCount: 0,
            missingFontCount: 0,
        });
    });

    it("keeps whitespace glyphs in the layout", () => {
        const layout = createTextLayout();
        const result = layout.layout(layoutInput({ text: "A B" }), createFontRecord());

        expect(result.glyphs.map((glyph) => glyph.codepoint)).toEqual([65, 32, 66]);
        expect(result.glyphs.map((glyph) => glyph.x)).toEqual([0, 10, 15]);
        expect(result.width).toBe(22);
    });

    it("advances newlines by scaled line height", () => {
        const layout = createTextLayout();
        const result = layout.layout(layoutInput({ text: "A\nB" }), createFontRecord());

        expect(result.glyphs.map((glyph) => glyph.y)).toEqual([0, 12]);
        expect(result.width).toBe(10);
        expect(result.height).toBe(24);
    });

    it("applies line height overrides", () => {
        const layout = createTextLayout();
        const result = layout.layout(
            layoutInput({ text: "A\nB", lineHeight: 20 }),
            createFontRecord(),
        );

        expect(result.glyphs.map((glyph) => glyph.y)).toEqual([0, 20]);
        expect(result.height).toBe(40);
    });

    it("supports top and alphabetic baseline placement", () => {
        const layout = createTextLayout();
        const font = createFontRecord();

        const top = layout.layout(layoutInput({ baseline: "top" }), font);
        const alphabetic = layout.layout(
            layoutInput({ baseline: "alphabetic" }),
            font,
        );

        expect(top.glyphs[0].y).toBe(0);
        expect(alphabetic.glyphs[0].y).toBe(-9);
    });

    it("scales metrics from font baseSize through fontSize", () => {
        const layout = createTextLayout();
        const result = layout.layout(
            layoutInput({ fontSize: 20 }),
            createFontRecord(),
        );

        expect(result.glyphs[0]).toMatchObject({
            x: 0,
            y: 0,
            w: 20,
            h: 16,
        });
        expect(result.width).toBe(20);
        expect(result.height).toBe(24);
    });

    it("applies kerning before the next glyph", () => {
        const layout = createTextLayout();
        const result = layout.layout(layoutInput({ text: "AB" }), createFontRecord());

        expect(result.glyphs.map((glyph) => glyph.x)).toEqual([0, 9]);
        expect(result.width).toBe(16);
    });

    it("applies letter spacing between visible glyphs", () => {
        const layout = createTextLayout();
        const result = layout.layout(
            layoutInput({ text: "AC", letterSpacing: 2 }),
            createFontRecord(),
        );

        expect(result.glyphs.map((glyph) => glyph.x)).toEqual([0, 12]);
        expect(result.width).toBe(18);
    });

    it("shifts center and right aligned lines after measuring them", () => {
        const layout = createTextLayout();
        const font = createFontRecord();

        const center = layout.layout(layoutInput({ text: "AB", align: "center" }), font);
        const right = layout.layout(layoutInput({ text: "AB", align: "right" }), font);

        expect(center.glyphs.map((glyph) => glyph.x)).toEqual([-8, 1]);
        expect(right.glyphs.map((glyph) => glyph.x)).toEqual([-16, -7]);
    });

    it("handles missing fonts without throwing", () => {
        const layout = createTextLayout();
        const result = layout.layout(layoutInput({ fontId: "font.missing" }), undefined);

        expect(result).toEqual({
            glyphs: [],
            width: 0,
            height: 0,
            missingGlyphCount: 0,
            missingFontCount: 1,
        });
        expect(layout.getStats()).toMatchObject({
            missingFontCount: 1,
            missingGlyphCount: 0,
        });
    });

    it("uses replacement glyph metrics for missing glyphs", () => {
        const layout = createTextLayout();
        const result = layout.layout(layoutInput({ text: "Z" }), createFontRecord());

        expect(result.glyphs).toHaveLength(1);
        expect(result.glyphs[0]).toMatchObject({
            codepoint: 63,
            sourceCharIndex: 0,
            w: 5,
        });
        expect(result.width).toBe(5);
        expect(result.missingGlyphCount).toBe(1);
    });

    it("skips missing glyphs without replacement and does not advance", () => {
        const layout = createTextLayout();
        const result = layout.layout(
            layoutInput({ text: "AZB" }),
            createFontRecord({ replacementCodepoint: undefined }),
        );

        expect(result.glyphs.map((glyph) => glyph.codepoint)).toEqual([65, 66]);
        expect(result.glyphs.map((glyph) => glyph.x)).toEqual([0, 9]);
        expect(result.width).toBe(16);
        expect(result.missingGlyphCount).toBe(1);
    });

    it("records cache hits and misses without keying transform or style fields", () => {
        const layout = createTextLayout();
        const font = createFontRecord();
        const firstInput = {
            ...layoutInput({ text: "AB" }),
            x: 10,
            y: 20,
            color: { r: 1, g: 0, b: 0 },
            opacity: 0.5,
            sortKey: 1,
        };
        const secondInput = {
            ...layoutInput({ text: "AB" }),
            x: 99,
            y: 50,
            tint: { r: 0, g: 1, b: 0 },
            opacity: 1,
            sortKey: 20,
        };

        const first = layout.layout(firstInput, font);
        const second = layout.layout(secondInput, font);

        expect(second).toBe(first);
        expect(layout.getStats()).toMatchObject({
            cacheHitCount: 1,
            cacheMissCount: 1,
            glyphCount: 4,
        });
    });

    it("invalidates cached layout by font generation", () => {
        const registry = createFontRegistry({ debug: true });
        const layout = createTextLayout();
        registry.register([createFont()]);
        const firstFont = registry.get("font.ui");
        if (!firstFont) throw new Error("missing first font");

        const first = layout.layout(layoutInput({ text: "A" }), firstFont);
        registry.register([
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
                        xAdvance: 20,
                    },
                ],
            }),
        ]);
        const secondFont = registry.get("font.ui");
        if (!secondFont) throw new Error("missing second font");

        const second = layout.layout(layoutInput({ text: "A" }), secondFont);

        expect(second).not.toBe(first);
        expect(first.width).toBe(10);
        expect(second.width).toBe(20);
        expect(layout.getStats()).toMatchObject({
            cacheHitCount: 0,
            cacheMissCount: 2,
        });
    });

    it("keeps the layout cache bounded", () => {
        const layout = createTextLayout({ maxCacheEntries: 1 });
        const font = createFontRecord();

        layout.layout(layoutInput({ text: "A" }), font);
        layout.layout(layoutInput({ text: "B" }), font);
        layout.layout(layoutInput({ text: "A" }), font);

        expect(layout.getStats()).toMatchObject({
            cacheHitCount: 0,
            cacheMissCount: 3,
        });
    });

    it("normalizes unsupported wrap and overflow intent to v1 visible unwrapped layout", () => {
        const layout = createTextLayout();
        const font = createFontRecord();
        const unsupported = {
            ...layoutInput({ text: "AB", maxWidth: 1 }),
            wrap: "word",
            overflow: "hidden",
        } as unknown as RenderTextLayoutInput;

        const result = layout.layout(unsupported, font);

        expect(result.glyphs.map((glyph) => glyph.codepoint)).toEqual([65, 66]);
        expect(result.width).toBe(16);
        expect(result.height).toBe(12);
    });
});
