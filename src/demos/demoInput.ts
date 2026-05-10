import { createGame, entity, scene, system } from "../cluster/engine/game";

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
    };
}

export default async () => {
    const DISPLAY_WIDTH = 800;
    const DISPLAY_HEIGHT = 600;
    const display = createDisplay();
    const PLAYER_SIZE = 24;
    const player = entity("input.player", {
        position: {
            x: DISPLAY_WIDTH / 2,
            y: DISPLAY_HEIGHT / 2,
        },
        prevPosition: {
            x: DISPLAY_WIDTH / 2,
            y: DISPLAY_HEIGHT / 2,
        },
        velocity: {
            x: 0,
            y: 0,
        },
        size: {
            w: PLAYER_SIZE,
            h: PLAYER_SIZE,
        },
        color: {
            r: 0.15,
            g: 0.39,
            b: 0.92,
        },
    });

    const inputSystem = system({
        id: "input-demo.input",
        phase: "input",
        execute(ctx) {
            const pointer = ctx.input.pointer;
            const [row] = ctx.world.query(["position", "prevPosition", "size"]);
            if (!row) return;

            const position = row.components.position;
            const prevPosition = row.components.prevPosition;
            const size = row.components.size;
            const currentX = Number(position.x.read());
            const currentY = Number(position.y.read());
            let width = Number(size.w.read());
            let height = Number(size.h.read());

            if (pointer.buttons.pressed(0)) {
                prevPosition.x.write(currentX);
                prevPosition.y.write(currentY);
                position.x.write(pointer.x - width / 2);
                position.y.write(pointer.y - height / 2);
            }

            if (pointer.wheelY !== 0) {
                const nextSize = Math.max(
                    12,
                    Math.min(72, width - pointer.wheelY * 0.05),
                );
                width = nextSize;
                height = nextSize;
                size.w.write(width);
                size.h.write(height);
            }
        },
    });

    const movementSystem = system({
        id: "input-demo.update",
        phase: "update",
        execute(ctx, dt) {
            const speed = 260 * (dt / 1000);
            const [row] = ctx.world.query([
                "position",
                "prevPosition",
                "velocity",
                "size",
            ]);
            if (!row) return;

            const position = row.components.position;
            const prevPosition = row.components.prevPosition;
            const size = row.components.size;
            let x = Number(position.x.read());
            let y = Number(position.y.read());
            const width = Number(size.w.read());
            const height = Number(size.h.read());

            prevPosition.x.write(x);
            prevPosition.y.write(y);

            if (
                ctx.input.keyboard.down("ArrowLeft") ||
                ctx.input.keyboard.down("KeyA")
            ) {
                x -= speed;
            }
            if (
                ctx.input.keyboard.down("ArrowRight") ||
                ctx.input.keyboard.down("KeyD")
            ) {
                x += speed;
            }
            if (
                ctx.input.keyboard.down("ArrowUp") ||
                ctx.input.keyboard.down("KeyW")
            ) {
                y -= speed;
            }
            if (
                ctx.input.keyboard.down("ArrowDown") ||
                ctx.input.keyboard.down("KeyS")
            ) {
                y += speed;
            }

            position.x.write(Math.max(0, Math.min(ctx.display.w - width, x)));
            position.y.write(Math.max(0, Math.min(ctx.display.h - height, y)));
        },
    });

    const demoScene = scene({
        id: "demo.input",
        setup(ctx) {
            ctx.addEntities(player);
            ctx.addSystems(inputSystem, movementSystem);
        },
    });

    const game = createGame({
        canvas: display.canvas,
        display: {
            mode: "fixed",
            size: { w: DISPLAY_WIDTH, h: DISPLAY_HEIGHT },
        },
        initialScene: demoScene,
    });

    await game.start();
};
