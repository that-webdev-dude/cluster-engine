import { createGame, entity, scene, system } from "../cluster/engine/game";

const WIDTH = 800;
const HEIGHT = 600;
const RECT_COUNT = 56;

type RenderDemoEntityConfig = Readonly<{
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    w: number;
    h: number;
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
    panel.style.width = "min(800px, calc(100vw - 32px))";
    panel.style.minHeight = "74px";
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

function createRect(config: RenderDemoEntityConfig) {
    return entity(config.id, {
        position: { x: config.x, y: config.y },
        prevPosition: { x: config.x, y: config.y },
        velocity: { x: config.vx, y: config.vy },
        size: { w: config.w, h: config.h },
        color: config.color,
    });
}

function createRects() {
    return Array.from({ length: RECT_COUNT }, (_, index) => {
        const lane = index % 8;
        const column = Math.floor(index / 8);
        const w = 18 + (index % 5) * 5;
        const h = 16 + (index % 4) * 6;
        const speedX = 45 + ((index * 17) % 100);
        const speedY = 35 + ((index * 23) % 90);
        const directionX = index % 2 === 0 ? 1 : -1;
        const directionY = index % 3 === 0 ? -1 : 1;

        return createRect({
            id: `demo.render.rect.${index}`,
            x: 36 + column * 88,
            y: 34 + lane * 66,
            vx: speedX * directionX,
            vy: speedY * directionY,
            w,
            h,
            color: {
                r: 0.12 + ((index * 29) % 70) / 100,
                g: 0.22 + ((index * 41) % 58) / 100,
                b: 0.26 + ((index * 53) % 60) / 100,
            },
        });
    });
}

function clampWithBounce(
    position: number,
    velocity: number,
    size: number,
    max: number,
): { position: number; velocity: number } {
    const upper = max - size;

    if (position < 0) {
        return { position: 0, velocity: Math.abs(velocity) };
    }
    if (position > upper) {
        return { position: upper, velocity: -Math.abs(velocity) };
    }

    return { position, velocity };
}

export default async function demoRenderGame(): Promise<void> {
    const canvas = createCanvas();
    const metricsPanel = createMetricsPanel();
    const rects = createRects();
    let frameCount = 0;
    let lastLoggedAt = 0;

    const renderScene = scene({
        id: "demo.render.game",
        setup(ctx) {
            ctx.addEntities(...rects);
            ctx.addSystems(
                system({
                    id: "demo.render.game.move",
                    phase: "update",
                    execute(gameCtx, dt) {
                        const seconds = dt / 1000;

                        for (const row of gameCtx.world.query([
                            "position",
                            "prevPosition",
                            "velocity",
                            "size",
                        ])) {
                            const position = row.components.position;
                            const prevPosition = row.components.prevPosition;
                            const velocity = row.components.velocity;
                            const size = row.components.size;
                            const x = Number(position.x.read());
                            const y = Number(position.y.read());
                            const vx = Number(velocity.x.read());
                            const vy = Number(velocity.y.read());
                            const w = Number(size.w.read());
                            const h = Number(size.h.read());
                            const nextX = clampWithBounce(
                                x + vx * seconds,
                                vx,
                                w,
                                gameCtx.display.w,
                            );
                            const nextY = clampWithBounce(
                                y + vy * seconds,
                                vy,
                                h,
                                gameCtx.display.h,
                            );

                            prevPosition.x.write(x);
                            prevPosition.y.write(y);
                            position.x.write(nextX.position);
                            position.y.write(nextY.position);
                            velocity.x.write(nextX.velocity);
                            velocity.y.write(nextY.velocity);
                        }
                    },
                }),
            );
        },
    });

    const game = createGame({
        canvas,
        display: {
            mode: "fixed",
            size: { w: WIDTH, h: HEIGHT },
        },
        initialScene: renderScene,
        debug: true,
    });

    await game.start();

    window.setInterval(() => {
        const render = game.debug.render;
        const metrics = {
            backend: render.backend,
            gfxState: render.gfxState,
            frameSeq: render.frameSeq,
            submit: render.lastSubmitResult,
            stats: render.stats,
        };

        metricsPanel.textContent = JSON.stringify(metrics, null, 2);
        frameCount = render.frameSeq;

        if (frameCount - lastLoggedAt >= 120) {
            lastLoggedAt = frameCount;
            console.log("Render game demo metrics", metrics);
        }
    }, 250);
}
