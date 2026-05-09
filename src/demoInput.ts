import { createGame, scene, system } from "./cluster/engine/game";

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
        canvas,
        ctx: canvas.getContext("2d") as CanvasRenderingContext2D,
    };
}

function drawLabel(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
) {
    ctx.fillStyle = "#0f172a";
    ctx.font = "14px Inter, system-ui, sans-serif";
    ctx.fillText(text, x, y);
}

export default async () => {
    const DISPLAY_WIDTH = 800;
    const DISPLAY_HEIGHT = 600;
    const display = createDisplay();
    const player = {
        x: DISPLAY_WIDTH / 2,
        y: DISPLAY_HEIGHT / 2,
        size: 24,
    };
    let pointerPulse = 0;

    const inputSystem = system({
        id: "input-demo.input",
        phase: "input",
        execute(ctx) {
            const pointer = ctx.input.pointer;

            if (pointer.buttons.pressed(0)) {
                player.x = pointer.x;
                player.y = pointer.y;
                pointerPulse = 1;
            }

            if (pointer.wheelY !== 0) {
                player.size = Math.max(
                    12,
                    Math.min(72, player.size - pointer.wheelY * 0.05),
                );
            }

            player.x = Math.max(0, Math.min(ctx.display.w, player.x));
            player.y = Math.max(0, Math.min(ctx.display.h, player.y));
        },
    });

    const movementSystem = system({
        id: "input-demo.update",
        phase: "update",
        execute(ctx, dt) {
            const speed = 260 * (dt / 1000);

            if (
                ctx.input.keyboard.down("ArrowLeft") ||
                ctx.input.keyboard.down("KeyA")
            ) {
                player.x -= speed;
            }
            if (
                ctx.input.keyboard.down("ArrowRight") ||
                ctx.input.keyboard.down("KeyD")
            ) {
                player.x += speed;
            }
            if (
                ctx.input.keyboard.down("ArrowUp") ||
                ctx.input.keyboard.down("KeyW")
            ) {
                player.y -= speed;
            }
            if (
                ctx.input.keyboard.down("ArrowDown") ||
                ctx.input.keyboard.down("KeyS")
            ) {
                player.y += speed;
            }

            pointerPulse = Math.max(0, pointerPulse - dt / 250);
            player.x = Math.max(0, Math.min(ctx.display.w, player.x));
            player.y = Math.max(0, Math.min(ctx.display.h, player.y));
        },
    });

    const demoScene = scene({
        id: "demo.input",
        setup(ctx) {
            ctx.addSystems(inputSystem, movementSystem);
        },
    });

    const game = createGame({
        canvas: display.canvas,
        display: {
            mode: "fixed",
            size: { w: DISPLAY_WIDTH, h: DISPLAY_HEIGHT },
        },
        prepareRender(ctx) {
            const canvasCtx = display.ctx;
            const pointer = ctx.input.pointer;
            const isPressed = pointer.buttons.down(0);

            canvasCtx.clearRect(0, 0, ctx.display.w, ctx.display.h);

            canvasCtx.fillStyle = "#f8fafc";
            canvasCtx.fillRect(0, 0, ctx.display.w, ctx.display.h);

            canvasCtx.strokeStyle = "#cbd5e1";
            canvasCtx.lineWidth = 1;
            canvasCtx.strokeRect(0.5, 0.5, ctx.display.w - 1, ctx.display.h - 1);

            canvasCtx.fillStyle = isPressed ? "#ef4444" : "#2563eb";
            canvasCtx.beginPath();
            canvasCtx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
            canvasCtx.fill();

            if (pointer.pointers.count > 0) {
                canvasCtx.strokeStyle = isPressed ? "#ef4444" : "#14b8a6";
                canvasCtx.lineWidth = 3;
                canvasCtx.beginPath();
                canvasCtx.arc(
                    pointer.x,
                    pointer.y,
                    12 + pointerPulse * 20,
                    0,
                    Math.PI * 2,
                );
                canvasCtx.stroke();

                canvasCtx.fillStyle = "#14b8a6";
                canvasCtx.beginPath();
                canvasCtx.arc(pointer.x, pointer.y, 4, 0, Math.PI * 2);
                canvasCtx.fill();
            }

            drawLabel(
                canvasCtx,
                `pointer: ${Math.round(pointer.x)}, ${Math.round(pointer.y)}  buttons: ${isPressed ? "down" : "up"}`,
                16,
                28,
            );
            drawLabel(
                canvasCtx,
                `keyboard: WASD / arrows move  |  click jumps  |  wheel resizes`,
                16,
                52,
            );
        },
        initialScene: demoScene,
    });

    await game.start();
};
