import { createGame, entity, scene, system } from "./cluster/engine/game";

function createDisplay() {
    const app = document.querySelector<HTMLDivElement>("#app");
    const canvas = document.createElement("canvas");
    canvas.id = "game-canvas";
    canvas.width = 800;
    canvas.height = 600;
    if (app) {
        app.appendChild(canvas);
    }
    return {
        ctx: canvas.getContext("2d") as CanvasRenderingContext2D,
        width: canvas.width,
        height: canvas.height,
        canvas,
    };
}

function drawRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
) {
    ctx.fillStyle = "black";
    ctx.fillRect(x, y, width, height);
}

export default async () => {
    const SCENE_ID = "demo-scene";
    const DISPLAY_WIDTH = 800;
    const DISPLAY_HEIGHT = 600;
    const PARTICLE_SIZE = 4;
    const PARTICLE_COUNT = 100;

    const display = createDisplay();

    function createParticles(count: number) {
        const entities = [];
        for (let i = 0; i < count; i++) {
            const x = Math.random() * (DISPLAY_WIDTH - PARTICLE_SIZE);
            const y = Math.random() * (DISPLAY_HEIGHT - PARTICLE_SIZE);

            const entity = {
                id: `rect-${i}`,
                prevPosition: {
                    x,
                    y,
                },
                position: {
                    x,
                    y,
                },
                velocity: {
                    x: (Math.random() - 0.5) * 400,
                    y: (Math.random() - 0.5) * 400,
                },
                size: {
                    width: PARTICLE_SIZE,
                    height: PARTICLE_SIZE,
                },
                color: {
                    r: 0,
                    g: 0,
                    b: 0,
                },
            };
            entities.push(entity);
        }
        return entities;
    }

    const particles = createParticles(PARTICLE_COUNT);

    const movementSystem = system({
        id: "movement",
        phase: "fixedUpdate",
        execute: (ctx, dt) => {
            ctx.world
                .query(["position", "prevPosition", "velocity"])
                .forEach((result) => {
                    const position = result.components.position;
                    const prevPosition = result.components.prevPosition;
                    const velocity = result.components.velocity;

                    let x = position.x.read() as number;
                    let y = position.y.read() as number;
                    const vx = velocity.x.read() as number;
                    const vy = velocity.y.read() as number;

                    prevPosition.x.write(x);
                    prevPosition.y.write(y);

                    x += vx * (dt / 1000);
                    y += vy * (dt / 1000);

                    const maxX = ctx.display.w - PARTICLE_SIZE;
                    const maxY = ctx.display.h - PARTICLE_SIZE;

                    if (x < 0 || x > maxX) {
                        x = Math.max(0, Math.min(maxX, x));
                        velocity.x.write(-vx);
                    }
                    if (y < 0 || y > maxY) {
                        y = Math.max(0, Math.min(maxY, y));
                        velocity.y.write(-vy);
                    }

                    position.x.write(x);
                    position.y.write(y);
                });
        },
    });

    // temporary render system using display for now
    const renderSystem = system({
        id: "render",
        phase: "preRender",
        execute: (ctx, alpha) => {
            display.ctx.clearRect(0, 0, ctx.display.w, ctx.display.h);

            ctx.world
                .query(["position", "prevPosition", "size"])
                .forEach((result) => {
                    const position = result.components.position;
                    const prevPosition = result.components.prevPosition;
                    const size = result.components.size;

                    const x = position.x.read() as number;
                    const y = position.y.read() as number;
                    const prevX = prevPosition.x.read() as number;
                    const prevY = prevPosition.y.read() as number;
                    const width = size.width.read() as number;
                    const height = size.height.read() as number;

                    const drawX = prevX + (x - prevX) * alpha;
                    const drawY = prevY + (y - prevY) * alpha;

                    drawRect(display.ctx, drawX, drawY, width, height);
                });
        },
    });

    const demoScene = scene({
        id: SCENE_ID,
        options: {
            blocksUpdateBelow: true,
            capturesInput: true,
        },
        setup(ctx) {
            ctx.addEntities(...particles);
            ctx.addSystems(movementSystem, renderSystem);
        },
    });

    const game = createGame({
        canvas: display.canvas,
        display: {
            mode: "fixed",
            size: { w: DISPLAY_WIDTH, h: DISPLAY_HEIGHT },
        },
        initialScene: demoScene,
        debug: true,
    });

    await game.start();
};
