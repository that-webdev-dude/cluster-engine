import {
    createRender,
    type RenderBitmapFontConfig,
    type RenderFrameInput,
    type RenderItem2D,
    type RenderTextureResourceConfig,
} from "../cluster/engine/services/render";

const WIDTH = 800;
const HEIGHT = 420;
const FONT_ID = "demo.bitmap.5x7";
const ATLAS_RESOURCE_ID = "demo.bitmap.5x7.page.main";
const GLYPH_W = 5;
const GLYPH_H = 7;
const CELL_W = 6;
const CELL_H = 8;
const ATLAS_COLUMNS = 14;
const GLYPH_ORDER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ?";

const GLYPH_PATTERNS: Record<string, readonly string[]> = {
    A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
    D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    G: ["01111", "10000", "10000", "10011", "10001", "10001", "01110"],
    H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
    J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
    K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
    R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
    X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
    Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
    "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"],
};

function createCanvas(): HTMLCanvasElement {
    const app = document.querySelector<HTMLDivElement>("#app");
    const canvas = document.createElement("canvas");
    canvas.id = "game-canvas";
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    app?.replaceChildren(canvas);
    return canvas;
}

function createMetricsPanel(): HTMLPreElement {
    const panel = document.createElement("pre");
    panel.setAttribute("aria-live", "polite");
    panel.style.margin = "12px 0 0";
    panel.style.padding = "10px 12px";
    panel.style.width = "min(800px, calc(100vw - 32px))";
    panel.style.minHeight = "104px";
    panel.style.border = "1px solid #d4d4d8";
    panel.style.borderRadius = "8px";
    panel.style.background = "#ffffff";
    panel.style.color = "#27272a";
    panel.style.font =
        "12px/1.45 ui-monospace, SFMono-Regular, Consolas, monospace";
    panel.style.whiteSpace = "pre-wrap";

    document.querySelector<HTMLDivElement>("#app")?.appendChild(panel);
    return panel;
}

function createAtlasData(): Uint8Array {
    const rows = Math.ceil(GLYPH_ORDER.length / ATLAS_COLUMNS);
    const width = ATLAS_COLUMNS * CELL_W;
    const height = rows * CELL_H;
    const data = new Uint8Array(width * height * 4);

    // Hand-authored 5x7 bitmap glyph fixture. White texels carry glyph alpha;
    // transparent texels remain empty so the textured 2D shader reveals letters.
    for (let glyphIndex = 0; glyphIndex < GLYPH_ORDER.length; glyphIndex++) {
        const glyph = GLYPH_ORDER[glyphIndex];
        const pattern = GLYPH_PATTERNS[glyph];
        const originX = (glyphIndex % ATLAS_COLUMNS) * CELL_W;
        const originY = Math.floor(glyphIndex / ATLAS_COLUMNS) * CELL_H;

        for (let y = 0; y < GLYPH_H; y++) {
            for (let x = 0; x < GLYPH_W; x++) {
                if (pattern[y][x] !== "1") continue;
                const offset = ((originY + y) * width + originX + x) * 4;
                data[offset] = 255;
                data[offset + 1] = 255;
                data[offset + 2] = 255;
                data[offset + 3] = 255;
            }
        }
    }

    return data;
}

function createAtlasTexture(): RenderTextureResourceConfig {
    return {
        id: ATLAS_RESOURCE_ID,
        label: "demo bitmap font atlas",
        width: ATLAS_COLUMNS * CELL_W,
        height: Math.ceil(GLYPH_ORDER.length / ATLAS_COLUMNS) * CELL_H,
        data: createAtlasData(),
    };
}

function createBitmapFont(): RenderBitmapFontConfig {
    const atlasWidth = ATLAS_COLUMNS * CELL_W;
    const atlasHeight = Math.ceil(GLYPH_ORDER.length / ATLAS_COLUMNS) * CELL_H;

    return {
        id: FONT_ID,
        kind: "bitmap",
        baseSize: 8,
        lineHeight: 9,
        baseline: 7,
        pages: [
            {
                id: "main",
                resourceId: ATLAS_RESOURCE_ID,
                width: atlasWidth,
                height: atlasHeight,
            },
        ],
        glyphs: Array.from(GLYPH_ORDER, (glyph, index) => ({
            codepoint: glyph.codePointAt(0) ?? 0,
            pageId: "main",
            x: (index % ATLAS_COLUMNS) * CELL_W,
            y: Math.floor(index / ATLAS_COLUMNS) * CELL_H,
            w: GLYPH_W,
            h: GLYPH_H,
            xOffset: 0,
            yOffset: 0,
            xAdvance: CELL_W,
        })),
        replacementCodepoint: "?".codePointAt(0),
    };
}

function createLabel(
    text: string,
    x: number,
    y: number,
    overrides: Partial<Extract<RenderItem2D, { kind: "text" }>> = {},
): Extract<RenderItem2D, { kind: "text" }> {
    return {
        kind: "text",
        sortKey: 10,
        text,
        fontId: FONT_ID,
        fontSize: 28,
        x,
        y,
        ...overrides,
    };
}

function createFrameInput(time: number): RenderFrameInput {
    const movingX = 98 + Math.sin(time / 700) * 70;

    return {
        target: { w: WIDTH, h: HEIGHT, dpr: 1 },
        alpha: 1,
        layers: [
            {
                id: "demo.text",
                order: 0,
                items: [
                    {
                        kind: "rect",
                        sortKey: 0,
                        x: 0,
                        y: 0,
                        w: WIDTH,
                        h: HEIGHT,
                        color: { r: 0.06, g: 0.08, b: 0.1 },
                    },
                    {
                        kind: "rect",
                        sortKey: 1,
                        x: 40,
                        y: 42,
                        w: 720,
                        h: 272,
                        color: { r: 0.13, g: 0.16, b: 0.18 },
                    },
                    {
                        kind: "sprite",
                        sortKey: 2,
                        x: 48,
                        y: 330,
                        w: 252,
                        h: 48,
                        resourceId: ATLAS_RESOURCE_ID,
                        tint: { r: 0.25, g: 0.78, b: 0.92 },
                        opacity: 0.55,
                        blend: "alpha",
                    },
                    createLabel("CLUSTER", 64, 70, {
                        fontSize: 44,
                        tint: { r: 0.58, g: 0.92, b: 0.8 },
                    }),
                    createLabel("STATIC", 68, 138, {
                        tint: { r: 0.93, g: 0.88, b: 0.55 },
                    }),
                    createLabel("TINT", 68, 188, {
                        tint: { r: 0.4, g: 0.72, b: 1 },
                    }),
                    createLabel("OPACITY", 68, 238, {
                        tint: { r: 1, g: 0.55, b: 0.72 },
                        opacity: 0.48,
                    }),
                    createLabel("MOVING", movingX, 288, {
                        tint: { r: 0.7, g: 1, b: 0.6 },
                    }),
                    createLabel("FALLBACK@CASE", 390, 188, {
                        tint: { r: 1, g: 0.68, b: 0.35 },
                    }),
                ],
            },
        ],
    };
}

export default async function demoTextRender(): Promise<void> {
    const canvas = createCanvas();
    const metricsPanel = createMetricsPanel();
    const render = createRender({
        canvas,
        debug: true,
        resources: {
            textures: [createAtlasTexture()],
            fonts: [createBitmapFont()],
        },
    });
    let lastLoggedAt = 0;

    await render.start();

    function frame(time: number): void {
        render.prepare(createFrameInput(time));
        render.execute();

        const metrics = {
            expected:
                "Visible bitmap text: CLUSTER, tinted labels, translucent OPACITY, moving MOVING, FALLBACK?CASE, and a cyan atlas sprite preview.",
            backend: render.view.backend,
            gfxState: render.view.gfxState,
            frameSeq: render.view.frameSeq,
            submit: render.view.lastSubmitResult,
            stats: render.view.stats,
        };

        metricsPanel.textContent = JSON.stringify(metrics, null, 2);

        if (render.view.frameSeq - lastLoggedAt >= 120) {
            lastLoggedAt = render.view.frameSeq;
            console.log("Text render demo metrics", metrics);
        }

        window.requestAnimationFrame(frame);
    }

    window.requestAnimationFrame(frame);
}
