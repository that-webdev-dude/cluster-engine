import type {
    RenderBitmapFontConfig,
    RenderBitmapFontPageConfig,
    RenderBitmapGlyphConfig,
    RenderFontId,
    RenderFontPageId,
    RenderGlyphKerningConfig,
    RenderResourceId,
    RenderUvRectInput,
} from "../service/Render.types";

export type RenderBitmapFontPageRecord = Readonly<{
    id: RenderFontPageId;
    resourceId: RenderResourceId;
    width: number;
    height: number;
}>;

export type RenderBitmapGlyphRecord = Readonly<{
    codepoint: number;
    pageId: RenderFontPageId;
    resourceId: RenderResourceId;
    x: number;
    y: number;
    w: number;
    h: number;
    xOffset: number;
    yOffset: number;
    xAdvance: number;
    uv: RenderUvRectInput;
}>;

export type RenderBitmapFontRecord = Readonly<{
    id: RenderFontId;
    label?: string;
    kind: "bitmap";
    baseSize: number;
    lineHeight: number;
    baseline: number;
    generation: number;
    pages: ReadonlyMap<RenderFontPageId, RenderBitmapFontPageRecord>;
    glyphs: ReadonlyMap<number, RenderBitmapGlyphRecord>;
    kernings: ReadonlyMap<string, number>;
    replacementCodepoint?: number;
}>;

export type FontRegistryStats = Readonly<{
    fontResourceCount: number;
    fontPageResourceCount: number;
    fontReplacementRegistrationCount: number;
    invalidFontRegistrationCount: number;
    missingFontCount: number;
    missingGlyphCount: number;
}>;

export type FontRegistry = Readonly<{
    register(fonts: readonly RenderBitmapFontConfig[]): void;
    get(id: RenderFontId): RenderBitmapFontRecord | undefined;
    getStats(): FontRegistryStats;
    recordMissingFont(): void;
    recordMissingGlyph(): void;
    clear(): void;
}>;

export type FontRegistryConfig = Readonly<{
    debug?: boolean;
}>;

type MutableFontRegistryStats = {
    fontResourceCount: number;
    fontPageResourceCount: number;
    fontReplacementRegistrationCount: number;
    invalidFontRegistrationCount: number;
    missingFontCount: number;
    missingGlyphCount: number;
};

const KERNING_SEPARATOR = ":";

function createEmptyStats(): MutableFontRegistryStats {
    return {
        fontResourceCount: 0,
        fontPageResourceCount: 0,
        fontReplacementRegistrationCount: 0,
        invalidFontRegistrationCount: 0,
        missingFontCount: 0,
        missingGlyphCount: 0,
    };
}

function isPositiveFinite(value: number): boolean {
    return Number.isFinite(value) && value > 0;
}

function isNonNegativeFinite(value: number): boolean {
    return Number.isFinite(value) && value >= 0;
}

function isCodepoint(value: number): boolean {
    return Number.isInteger(value) && value >= 0;
}

function trimId(value: string): string {
    return value.trim();
}

function createKerningKey(left: number, right: number): string {
    return `${left}${KERNING_SEPARATOR}${right}`;
}

function countPages(fonts: ReadonlyMap<RenderFontId, RenderBitmapFontRecord>): number {
    let count = 0;
    for (const font of fonts.values()) count += font.pages.size;
    return count;
}

export function createFontRegistry(
    config: FontRegistryConfig = {},
): FontRegistry {
    const debug = config.debug ?? false;
    const fonts = new Map<RenderFontId, RenderBitmapFontRecord>();
    const stats = createEmptyStats();

    function snapshotStats(): FontRegistryStats {
        return {
            ...stats,
            fontResourceCount: fonts.size,
            fontPageResourceCount: countPages(fonts),
        };
    }

    function reject(message: string): undefined {
        stats.invalidFontRegistrationCount++;
        if (debug) {
            throw new Error(`FontRegistry.register: ${message}`);
        }
        return undefined;
    }

    function validatePage(
        fontId: RenderFontId,
        page: RenderBitmapFontPageConfig,
        pages: Map<RenderFontPageId, RenderBitmapFontPageRecord>,
    ): RenderBitmapFontPageRecord | undefined {
        const pageId = trimId(page.id);
        if (!pageId) return reject(`font "${fontId}" page id is required`);
        if (pages.has(pageId)) {
            return reject(`font "${fontId}" page "${pageId}" is duplicated`);
        }
        if (!trimId(page.resourceId)) {
            return reject(
                `font "${fontId}" page "${pageId}" resourceId is required`,
            );
        }
        if (!isPositiveFinite(page.width)) {
            return reject(
                `font "${fontId}" page "${pageId}" width must be a finite positive number`,
            );
        }
        if (!isPositiveFinite(page.height)) {
            return reject(
                `font "${fontId}" page "${pageId}" height must be a finite positive number`,
            );
        }

        return Object.freeze({
            id: pageId,
            resourceId: trimId(page.resourceId),
            width: page.width,
            height: page.height,
        });
    }

    function validateGlyph(
        fontId: RenderFontId,
        glyph: RenderBitmapGlyphConfig,
        pages: ReadonlyMap<RenderFontPageId, RenderBitmapFontPageRecord>,
        glyphs: Map<number, RenderBitmapGlyphRecord>,
    ): RenderBitmapGlyphRecord | undefined {
        if (!isCodepoint(glyph.codepoint)) {
            return reject(`font "${fontId}" glyph codepoint must be an integer >= 0`);
        }
        if (glyphs.has(glyph.codepoint)) {
            return reject(
                `font "${fontId}" glyph ${glyph.codepoint} is duplicated`,
            );
        }

        const pageId = trimId(glyph.pageId);
        const page = pages.get(pageId);
        if (!page) {
            return reject(
                `font "${fontId}" glyph ${glyph.codepoint} references unknown page "${pageId}"`,
            );
        }
        if (!isNonNegativeFinite(glyph.x) || !isNonNegativeFinite(glyph.y)) {
            return reject(
                `font "${fontId}" glyph ${glyph.codepoint} atlas position must be finite and non-negative`,
            );
        }
        if (!isPositiveFinite(glyph.w) || !isPositiveFinite(glyph.h)) {
            return reject(
                `font "${fontId}" glyph ${glyph.codepoint} size must be finite and positive`,
            );
        }
        if (glyph.x + glyph.w > page.width || glyph.y + glyph.h > page.height) {
            return reject(
                `font "${fontId}" glyph ${glyph.codepoint} atlas rectangle exceeds page "${pageId}"`,
            );
        }
        if (
            !Number.isFinite(glyph.xOffset) ||
            !Number.isFinite(glyph.yOffset) ||
            !Number.isFinite(glyph.xAdvance)
        ) {
            return reject(
                `font "${fontId}" glyph ${glyph.codepoint} metrics must be finite numbers`,
            );
        }

        return Object.freeze({
            codepoint: glyph.codepoint,
            pageId,
            resourceId: page.resourceId,
            x: glyph.x,
            y: glyph.y,
            w: glyph.w,
            h: glyph.h,
            xOffset: glyph.xOffset,
            yOffset: glyph.yOffset,
            xAdvance: glyph.xAdvance,
            uv: Object.freeze({
                u: glyph.x / page.width,
                v: glyph.y / page.height,
                w: glyph.w / page.width,
                h: glyph.h / page.height,
            }),
        });
    }

    function validateKerning(
        fontId: RenderFontId,
        kerning: RenderGlyphKerningConfig,
        kernings: Map<string, number>,
    ): boolean {
        if (!isCodepoint(kerning.left) || !isCodepoint(kerning.right)) {
            reject(`font "${fontId}" kerning codepoints must be integers >= 0`);
            return false;
        }
        if (!Number.isFinite(kerning.amount)) {
            reject(`font "${fontId}" kerning amount must be finite`);
            return false;
        }

        kernings.set(createKerningKey(kerning.left, kerning.right), kerning.amount);
        return true;
    }

    function buildRecord(
        config: RenderBitmapFontConfig,
    ): RenderBitmapFontRecord | undefined {
        const id = trimId(config.id);
        if (!id) return reject("font id is required");
        if (config.kind !== "bitmap") {
            return reject(`font "${id}" kind must be "bitmap"`);
        }
        if (!isPositiveFinite(config.baseSize)) {
            return reject(`font "${id}" baseSize must be a finite positive number`);
        }
        if (!isPositiveFinite(config.lineHeight)) {
            return reject(`font "${id}" lineHeight must be a finite positive number`);
        }
        if (!isNonNegativeFinite(config.baseline)) {
            return reject(
                `font "${id}" baseline must be a finite non-negative number`,
            );
        }
        if (config.pages.length === 0) {
            return reject(`font "${id}" must define at least one page`);
        }

        const pages = new Map<RenderFontPageId, RenderBitmapFontPageRecord>();
        for (const page of config.pages) {
            const record = validatePage(id, page, pages);
            if (!record) return undefined;
            pages.set(record.id, record);
        }

        const glyphs = new Map<number, RenderBitmapGlyphRecord>();
        for (const glyph of config.glyphs) {
            const record = validateGlyph(id, glyph, pages, glyphs);
            if (!record) return undefined;
            glyphs.set(record.codepoint, record);
        }

        const kernings = new Map<string, number>();
        for (const kerning of config.kernings ?? []) {
            if (!validateKerning(id, kerning, kernings)) return undefined;
        }

        if (
            config.replacementCodepoint !== undefined &&
            !isCodepoint(config.replacementCodepoint)
        ) {
            return reject(
                `font "${id}" replacementCodepoint must be an integer >= 0`,
            );
        }

        const previous = fonts.get(id);
        const generation = (previous?.generation ?? 0) + 1;

        return Object.freeze({
            id,
            label: config.label,
            kind: "bitmap",
            baseSize: config.baseSize,
            lineHeight: config.lineHeight,
            baseline: config.baseline,
            generation,
            pages,
            glyphs,
            kernings,
            replacementCodepoint: config.replacementCodepoint,
        });
    }

    return Object.freeze({
        register(nextFonts: readonly RenderBitmapFontConfig[]): void {
            for (const config of nextFonts) {
                const record = buildRecord(config);
                if (!record) continue;
                if (fonts.has(record.id)) {
                    stats.fontReplacementRegistrationCount++;
                }
                fonts.set(record.id, record);
            }
        },
        get(id: RenderFontId): RenderBitmapFontRecord | undefined {
            return fonts.get(id);
        },
        getStats: snapshotStats,
        recordMissingFont(): void {
            stats.missingFontCount++;
        },
        recordMissingGlyph(): void {
            stats.missingGlyphCount++;
        },
        clear(): void {
            fonts.clear();
            stats.fontResourceCount = 0;
            stats.fontPageResourceCount = 0;
            stats.fontReplacementRegistrationCount = 0;
            stats.invalidFontRegistrationCount = 0;
            stats.missingFontCount = 0;
            stats.missingGlyphCount = 0;
        },
    });
}
