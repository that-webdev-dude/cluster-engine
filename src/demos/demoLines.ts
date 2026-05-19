import {
    createRender,
    type RenderFrameInput,
    type RenderItem2D,
} from "../cluster/engine/services/render";

const WIDTH = 900;
const HEIGHT = 560;
const LINE_COUNT = 180;

type FloatingLine = Readonly<{
    centerX: number;
    centerY: number;
    radiusX: number;
    radiusY: number;
    driftPhase: number;
    driftSpeed: number;
    angle: number;
    spinSpeed: number;
    length: number;
    strokeWidth: number;
    color: Readonly<{
        r: number;
        g: number;
        b: number;
    }>;
}>;

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
    panel.style.width = "min(900px, calc(100vw - 32px))";
    panel.style.minHeight = "92px";
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

function createLine(index: number): FloatingLine {
    const column = index % 18;
    const row = Math.floor(index / 18);
    const hueOffset = (index * 37) % 100;

    return {
        centerX: 42 + column * 48 + ((row % 2) * 23),
        centerY: 42 + row * 48,
        radiusX: 18 + ((index * 11) % 42),
        radiusY: 12 + ((index * 17) % 34),
        driftPhase: index * 0.43,
        driftSpeed: 0.35 + ((index * 13) % 80) / 100,
        angle: index * 0.31,
        spinSpeed: (index % 2 === 0 ? 1 : -1) * (0.45 + (index % 9) * 0.12),
        length: 18 + ((index * 19) % 58),
        strokeWidth: 1 + (index % 4) * 0.7,
        color: {
            r: 0.18 + hueOffset / 180,
            g: 0.34 + ((index * 53) % 56) / 100,
            b: 0.38 + ((index * 29) % 50) / 100,
        },
    };
}

function wrap(value: number, max: number): number {
    return ((value % max) + max) % max;
}

function createLineItem(
    line: FloatingLine,
    index: number,
    seconds: number,
): Extract<RenderItem2D, { kind: "line" }> {
    const drift = seconds * line.driftSpeed + line.driftPhase;
    const centerX = wrap(
        line.centerX + Math.cos(drift) * line.radiusX + seconds * 14,
        WIDTH,
    );
    const centerY = wrap(
        line.centerY + Math.sin(drift * 0.87) * line.radiusY + seconds * 9,
        HEIGHT,
    );
    const radians = line.angle + seconds * line.spinSpeed;
    const halfLength = line.length * 0.5;
    const dx = Math.cos(radians) * halfLength;
    const dy = Math.sin(radians) * halfLength;

    return {
        kind: "line",
        sortKey: index,
        startX: centerX - dx,
        startY: centerY - dy,
        endX: centerX + dx,
        endY: centerY + dy,
        strokeWidth: line.strokeWidth,
        color: line.color,
        blend: "alpha",
        opacity: 0.62 + Math.sin(drift * 1.3) * 0.24,
    };
}

function createFrameInput(
    lines: readonly FloatingLine[],
    time: number,
): RenderFrameInput {
    const seconds = time / 1000;
    const items: RenderItem2D[] = [
        {
            kind: "rect",
            sortKey: -1,
            x: 0,
            y: 0,
            w: WIDTH,
            h: HEIGHT,
            color: { r: 0.035, g: 0.044, b: 0.055 },
        },
    ];

    for (let i = 0; i < lines.length; i++) {
        items.push(createLineItem(lines[i], i, seconds));
    }

    return {
        target: { w: WIDTH, h: HEIGHT, dpr: 1 },
        alpha: 1,
        layers: [
            {
                id: "demo.lines",
                order: 0,
                items,
            },
        ],
    };
}

export default async function demoLines(): Promise<void> {
    const canvas = createCanvas();
    const metricsPanel = createMetricsPanel();
    const render = createRender({
        canvas,
        debug: true,
    });
    const lines = Array.from({ length: LINE_COUNT }, (_, index) =>
        createLine(index),
    );
    let lastLoggedAt = 0;

    await render.start();

    function frame(time: number): void {
        render.prepare(createFrameInput(lines, time));
        render.execute();

        const metrics = {
            expected:
                "Many colored line primitives floating across the canvas while each rotates around its center.",
            lineCount: LINE_COUNT,
            backend: render.view.backend,
            gfxState: render.view.gfxState,
            frameSeq: render.view.frameSeq,
            submit: render.view.lastSubmitResult,
            stats: render.view.stats,
        };

        metricsPanel.textContent = JSON.stringify(metrics, null, 2);

        if (render.view.frameSeq - lastLoggedAt >= 120) {
            lastLoggedAt = render.view.frameSeq;
            console.log("Lines render demo metrics", metrics);
        }

        window.requestAnimationFrame(frame);
    }

    window.requestAnimationFrame(frame);
}
