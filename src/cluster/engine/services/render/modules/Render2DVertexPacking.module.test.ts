import { describe, expect, it } from "vitest";
import { createFontRegistry } from "./FontRegistry.module";
import { createRender2DPrepare } from "./Render2DPrepare.module";
import { createTextLayout } from "./TextLayout.module";
import { writeRender2DBatchVertexData } from "./Render2DVertexPacking.module";
import type {
    RenderBitmapFontConfig,
    RenderFrameInput,
} from "../service/Render.types";

function expectFloatsClose(
    actual: readonly number[],
    expected: readonly number[],
): void {
    expect(actual).toHaveLength(expected.length);
    for (let i = 0; i < expected.length; i++) {
        expect(actual[i]).toBeCloseTo(expected[i], 5);
    }
}

function createFont(): RenderBitmapFontConfig {
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
        ],
    };
}

function createInput(): RenderFrameInput {
    return {
        target: { w: 100, h: 100, dpr: 1 },
        alpha: 1,
        layers: [
            {
                id: "main",
                order: 0,
                items: [
                    {
                        kind: "text",
                        sortKey: 0,
                        x: 10,
                        y: 20,
                        text: "A",
                        fontId: "font.ui",
                        tint: { r: 0.25, g: 0.5, b: 0.75 },
                        opacity: 0.8,
                    },
                ],
            },
        ],
    };
}

describe("writeRender2DBatchVertexData", () => {
    it("packs lowered text through private glyph geometry, not public sprites", () => {
        const registry = createFontRegistry({ debug: true });
        registry.register([createFont()]);
        const frame = createRender2DPrepare({
            fontRegistry: registry,
            textLayout: createTextLayout(),
        }).prepare(createInput());

        expect(frame.items[0]).toMatchObject({
            sourceKind: "text",
            kind: "glyph-quad",
            resourceId: "font.ui.page.main",
        });
        expect(frame.items[0]).not.toHaveProperty("item");
        expect(frame.batches[0]).toMatchObject({
            pipelineFamily: "textured-2d",
            vertexLayout: "position-uv-tint-2d",
            resourceId: "font.ui.page.main",
            containsText: true,
        });

        const packed = writeRender2DBatchVertexData(
            new Float32Array(0),
            frame,
            frame.batches[0],
        );

        expect(packed.length).toBe(48);
        expectFloatsClose(
            Array.from(packed.data.slice(0, 8)),
            [-0.8, 0.6, 0, 0, 0.25, 0.5, 0.75, 0.8],
        );
        expectFloatsClose(
            Array.from(packed.data.slice(40, 48)),
            [-0.6, 0.44, 0.1, 0.16, 0.25, 0.5, 0.75, 0.8],
        );
    });
});
