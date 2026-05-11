import type {
    RenderFontId,
    RenderFontPageId,
    RenderResourceId,
    RenderUvRectInput,
} from "../service/Render.types";
import type {
    RenderBitmapFontRecord,
    RenderBitmapGlyphRecord,
} from "./FontRegistry.module";

export type RenderTextLayoutAlign = "left" | "center" | "right";
export type RenderTextLayoutBaseline = "top" | "alphabetic";
export type RenderTextLayoutWrap = "none";
export type RenderTextLayoutOverflow = "visible";

export type RenderTextLayoutInput = Readonly<{
    text: string;
    fontId: RenderFontId;
    fontSize?: number;
    lineHeight?: number;
    letterSpacing?: number;
    align?: RenderTextLayoutAlign;
    baseline?: RenderTextLayoutBaseline;
    maxWidth?: number;
    wrap?: RenderTextLayoutWrap;
    overflow?: RenderTextLayoutOverflow;
}>;

export type RenderTextGlyphLayout = Readonly<{
    codepoint: number;
    sourceCharIndex: number;
    pageId: RenderFontPageId;
    resourceId: RenderResourceId;
    x: number;
    y: number;
    w: number;
    h: number;
    uv: RenderUvRectInput;
}>;

export type RenderTextLayoutResult = Readonly<{
    glyphs: readonly RenderTextGlyphLayout[];
    width: number;
    height: number;
    missingGlyphCount: number;
    missingFontCount: number;
}>;

export type TextLayoutStats = Readonly<{
    cacheHitCount: number;
    cacheMissCount: number;
    glyphCount: number;
    missingFontCount: number;
    missingGlyphCount: number;
}>;

export type TextLayoutConfig = Readonly<{
    maxCacheEntries?: number;
}>;

export type TextLayoutModule = Readonly<{
    layout(
        input: RenderTextLayoutInput,
        font: RenderBitmapFontRecord | undefined,
    ): RenderTextLayoutResult;
    getStats(): TextLayoutStats;
    clearCache(): void;
}>;

type MutableTextLayoutStats = {
    cacheHitCount: number;
    cacheMissCount: number;
    glyphCount: number;
    missingFontCount: number;
    missingGlyphCount: number;
};

type ResolvedLayoutInput = Readonly<{
    text: string;
    fontId: RenderFontId;
    fontGeneration: number;
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    align: RenderTextLayoutAlign;
    baseline: RenderTextLayoutBaseline;
    maxWidth?: number;
    wrap: RenderTextLayoutWrap;
    overflow: RenderTextLayoutOverflow;
}>;

type MutableLineLayout = {
    glyphs: RenderTextGlyphLayout[];
    width: number;
};

const DEFAULT_MAX_CACHE_ENTRIES = 256;

function createEmptyStats(): MutableTextLayoutStats {
    return {
        cacheHitCount: 0,
        cacheMissCount: 0,
        glyphCount: 0,
        missingFontCount: 0,
        missingGlyphCount: 0,
    };
}

function normalizeFinite(value: number | undefined, fallback: number): number {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizePositive(value: number | undefined, fallback: number): number {
    return typeof value === "number" && Number.isFinite(value) && value > 0
        ? value
        : fallback;
}

function normalizeAlign(
    align: RenderTextLayoutInput["align"],
): RenderTextLayoutAlign {
    return align === "center" || align === "right" ? align : "left";
}

function normalizeBaseline(
    baseline: RenderTextLayoutInput["baseline"],
): RenderTextLayoutBaseline {
    return baseline === "alphabetic" ? "alphabetic" : "top";
}

function normalizeMaxWidth(maxWidth: number | undefined): number | undefined {
    return typeof maxWidth === "number" &&
        Number.isFinite(maxWidth) &&
        maxWidth > 0
        ? maxWidth
        : undefined;
}

function normalizeWrap(_wrap: RenderTextLayoutInput["wrap"]): RenderTextLayoutWrap {
    // V1 accepts wrapping intent but implements only unwrapped layout.
    return "none";
}

function normalizeOverflow(
    _overflow: RenderTextLayoutInput["overflow"],
): RenderTextLayoutOverflow {
    // V1 accepts overflow intent but implements only visible glyph output.
    return "visible";
}

function resolveInput(
    input: RenderTextLayoutInput,
    font: RenderBitmapFontRecord,
): ResolvedLayoutInput {
    return {
        text: input.text,
        fontId: input.fontId,
        fontGeneration: font.generation,
        fontSize: normalizePositive(input.fontSize, font.baseSize),
        lineHeight: normalizePositive(input.lineHeight, font.lineHeight),
        letterSpacing: normalizeFinite(input.letterSpacing, 0),
        align: normalizeAlign(input.align),
        baseline: normalizeBaseline(input.baseline),
        maxWidth: normalizeMaxWidth(input.maxWidth),
        wrap: normalizeWrap(input.wrap),
        overflow: normalizeOverflow(input.overflow),
    };
}

function createCacheKey(input: ResolvedLayoutInput): string {
    return JSON.stringify([
        input.fontId,
        input.fontGeneration,
        input.text,
        input.fontSize,
        input.lineHeight,
        input.letterSpacing,
        input.align,
        input.baseline,
        input.maxWidth ?? null,
        input.wrap,
        input.overflow,
    ]);
}

function readCodepoint(text: string, index: number): {
    codepoint: number;
    nextIndex: number;
} {
    const codepoint = text.codePointAt(index) ?? 0;
    return {
        codepoint,
        nextIndex: index + (codepoint > 0xffff ? 2 : 1),
    };
}

function getKerning(
    font: RenderBitmapFontRecord,
    left: number,
    right: number,
): number {
    return font.kernings.get(`${left}:${right}`) ?? 0;
}

function resolveGlyph(
    font: RenderBitmapFontRecord,
    codepoint: number,
): { glyph: RenderBitmapGlyphRecord | undefined; missing: boolean } {
    const glyph = font.glyphs.get(codepoint);
    if (glyph) return { glyph, missing: false };

    const replacement =
        font.replacementCodepoint === undefined
            ? undefined
            : font.glyphs.get(font.replacementCodepoint);
    return { glyph: replacement, missing: true };
}

function alignLine(line: MutableLineLayout, align: RenderTextLayoutAlign): void {
    if (align === "left" || line.width === 0) return;
    const shift = align === "center" ? -line.width / 2 : -line.width;
    for (let i = 0; i < line.glyphs.length; i++) {
        const glyph = line.glyphs[i];
        line.glyphs[i] = Object.freeze({
            ...glyph,
            x: glyph.x + shift,
        });
    }
}

function commitLine(
    lines: MutableLineLayout[],
    line: MutableLineLayout,
    align: RenderTextLayoutAlign,
): void {
    alignLine(line, align);
    lines.push(line);
}

function createGlyphLayout(args: {
    glyph: RenderBitmapGlyphRecord;
    sourceCharIndex: number;
    cursorX: number;
    lineTop: number;
    baselineOffset: number;
    scale: number;
}): RenderTextGlyphLayout {
    const { glyph, sourceCharIndex, cursorX, lineTop, baselineOffset, scale } =
        args;

    return Object.freeze({
        codepoint: glyph.codepoint,
        sourceCharIndex,
        pageId: glyph.pageId,
        resourceId: glyph.resourceId,
        x: cursorX + glyph.xOffset * scale,
        y: lineTop + baselineOffset + glyph.yOffset * scale,
        w: glyph.w * scale,
        h: glyph.h * scale,
        uv: glyph.uv,
    });
}

function createResult(args: {
    lines: readonly MutableLineLayout[];
    lineCount: number;
    lineHeight: number;
    missingGlyphCount: number;
    missingFontCount: number;
}): RenderTextLayoutResult {
    const glyphs: RenderTextGlyphLayout[] = [];
    let width = 0;
    for (const line of args.lines) {
        width = Math.max(width, line.width);
        glyphs.push(...line.glyphs);
    }

    return Object.freeze({
        glyphs: Object.freeze(glyphs),
        width,
        height: args.lineCount === 0 ? 0 : args.lineCount * args.lineHeight,
        missingGlyphCount: args.missingGlyphCount,
        missingFontCount: args.missingFontCount,
    });
}

function addStats(
    stats: MutableTextLayoutStats,
    result: RenderTextLayoutResult,
): void {
    stats.glyphCount += result.glyphs.length;
    stats.missingFontCount += result.missingFontCount;
    stats.missingGlyphCount += result.missingGlyphCount;
}

function layoutText(
    input: ResolvedLayoutInput,
    font: RenderBitmapFontRecord,
): RenderTextLayoutResult {
    if (input.text.length === 0) {
        return createResult({
            lines: [],
            lineCount: 0,
            lineHeight: 0,
            missingGlyphCount: 0,
            missingFontCount: 0,
        });
    }

    const scale = input.fontSize / font.baseSize;
    const lineHeight = input.lineHeight * scale;
    const baselineOffset =
        input.baseline === "alphabetic" ? -font.baseline * scale : 0;
    const letterSpacing = input.letterSpacing * scale;
    const lines: MutableLineLayout[] = [];
    let currentLine: MutableLineLayout = { glyphs: [], width: 0 };
    let lineIndex = 0;
    let cursorX = 0;
    let previousCodepoint: number | undefined;
    let missingGlyphCount = 0;

    for (let index = 0; index < input.text.length; ) {
        const sourceCharIndex = index;
        const { codepoint, nextIndex } = readCodepoint(input.text, index);
        index = nextIndex;

        if (codepoint === 10) {
            currentLine.width = cursorX;
            commitLine(lines, currentLine, input.align);
            currentLine = { glyphs: [], width: 0 };
            lineIndex++;
            cursorX = 0;
            previousCodepoint = undefined;
            continue;
        }

        const resolved = resolveGlyph(font, codepoint);
        if (resolved.missing) missingGlyphCount++;
        if (!resolved.glyph) {
            continue;
        }

        if (previousCodepoint !== undefined) {
            cursorX += letterSpacing;
            cursorX += getKerning(font, previousCodepoint, resolved.glyph.codepoint) *
                scale;
        }

        currentLine.glyphs.push(
            createGlyphLayout({
                glyph: resolved.glyph,
                sourceCharIndex,
                cursorX,
                lineTop: lineIndex * lineHeight,
                baselineOffset,
                scale,
            }),
        );
        cursorX += resolved.glyph.xAdvance * scale;
        currentLine.width = cursorX;
        previousCodepoint = resolved.glyph.codepoint;
    }

    currentLine.width = cursorX;
    commitLine(lines, currentLine, input.align);

    return createResult({
        lines,
        lineCount: lines.length,
        lineHeight,
        missingGlyphCount,
        missingFontCount: 0,
    });
}

export function createTextLayout(
    config: TextLayoutConfig = {},
): TextLayoutModule {
    const maxCacheEntries = Math.max(
        1,
        Math.floor(config.maxCacheEntries ?? DEFAULT_MAX_CACHE_ENTRIES),
    );
    const cache = new Map<string, RenderTextLayoutResult>();
    const stats = createEmptyStats();

    function remember(key: string, result: RenderTextLayoutResult): void {
        cache.set(key, result);
        while (cache.size > maxCacheEntries) {
            const oldest = cache.keys().next().value as string | undefined;
            if (oldest === undefined) break;
            cache.delete(oldest);
        }
    }

    return Object.freeze({
        layout(
            input: RenderTextLayoutInput,
            font: RenderBitmapFontRecord | undefined,
        ): RenderTextLayoutResult {
            if (!font) {
                const result = createResult({
                    lines: [],
                    lineCount: 0,
                    lineHeight: 0,
                    missingGlyphCount: 0,
                    missingFontCount: 1,
                });
                addStats(stats, result);
                return result;
            }

            const resolved = resolveInput(input, font);
            const key = createCacheKey(resolved);
            const cached = cache.get(key);
            if (cached) {
                cache.delete(key);
                cache.set(key, cached);
                stats.cacheHitCount++;
                addStats(stats, cached);
                return cached;
            }

            stats.cacheMissCount++;
            const result = layoutText(resolved, font);
            remember(key, result);
            addStats(stats, result);
            return result;
        },
        getStats(): TextLayoutStats {
            return { ...stats };
        },
        clearCache(): void {
            cache.clear();
        },
    });
}
