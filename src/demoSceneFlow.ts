import {
    createGame,
    entity,
    scene,
    system,
    type Game,
    type GameAuthoredScene,
} from "./cluster/engine/game";

function createDisplay() {
    const app = document.querySelector<HTMLDivElement>("#app");
    const canvas = document.createElement("canvas");
    canvas.id = "game-canvas";
    canvas.width = 800;
    canvas.height = 600;
    app?.appendChild(canvas);

    return {
        canvas,
    };
}

export default async () => {
    const WIDTH = 800;
    const HEIGHT = 600;
    const PARTICLE_SIZE = 5;
    const PARTICLE_COUNT = 80;

    const display = createDisplay();
    let horizontalScene: GameAuthoredScene;
    let verticalScene: GameAuthoredScene;
    let game: Game;
    let lastLoggedScene = "";

    function logSceneFlow() {
        const activeScene = game.debug.sceneStack.instanceIds[0];
        if (!activeScene || activeScene === lastLoggedScene) return;

        lastLoggedScene = activeScene;
        console.log("Scene flow demo", {
            activeScene,
            stores: game.debug.world.stores.map((store) => store.storeId),
            render: game.debug.render.stats,
        });
    }

    function createParticles(
        sceneId: string,
        direction: "horizontal" | "vertical",
        color: { r: number; g: number; b: number },
    ) {
        return Array.from({ length: PARTICLE_COUNT }, (_, index) => {
            const speed = 60 + Math.random() * 180;
            const x = Math.random() * WIDTH;
            const y = Math.random() * HEIGHT;

            return entity(`${sceneId}.particle.${index}`, {
                position: {
                    x,
                    y,
                },
                prevPosition: {
                    x,
                    y,
                },
                velocity: {
                    x: direction === "horizontal" ? speed : 0,
                    y: direction === "vertical" ? speed : 0,
                },
                size: {
                    w: PARTICLE_SIZE,
                    h: PARTICLE_SIZE,
                },
                color,
            });
        });
    }

    function wrapPosition(value: number, max: number): number {
        return ((value % max) + max) % max;
    }

    function createFlowScene(config: {
        id: string;
        label: string;
        color: string;
        direction: "horizontal" | "vertical";
        nextScene: () => GameAuthoredScene;
    }) {
        const color =
            config.direction === "horizontal"
                ? { r: 0.12, g: 0.44, b: 0.92 }
                : { r: 0.82, g: 0.6, b: 0.13 };
        const particles = createParticles(config.id, config.direction, color);

        return scene({
            id: config.id,
            options: {
                blocksUpdateBelow: true,
                capturesInput: true,
            },
            setup(ctx) {
                ctx.addEntities(...particles);
                ctx.addSystems(
                    system({
                        id: `${config.id}.toggle`,
                        phase: "input",
                        execute(gameCtx) {
                            logSceneFlow();
                            if (gameCtx.input.keyboard.pressed("Space")) {
                                gameCtx.scene.request.set(config.nextScene());
                            }
                        },
                    }),
                    system({
                        id: `${config.id}.move`,
                        phase: "update",
                        execute(gameCtx, dt) {
                            gameCtx.world
                                .query(["position", "prevPosition", "velocity"])
                                .forEach((row) => {
                                    const position = row.components.position;
                                    const prevPosition =
                                        row.components.prevPosition;
                                    const velocity = row.components.velocity;
                                    const x = position.x.read() as number;
                                    const y = position.y.read() as number;
                                    const vx = velocity.x.read() as number;
                                    const vy = velocity.y.read() as number;
                                    const nextX = x + vx * (dt / 1000);
                                    const nextY = y + vy * (dt / 1000);
                                    const wrappedX =
                                        nextX < 0 || nextX >= WIDTH;
                                    const wrappedY =
                                        nextY < 0 || nextY >= HEIGHT;
                                    const renderX = wrapPosition(nextX, WIDTH);
                                    const renderY = wrapPosition(nextY, HEIGHT);

                                    prevPosition.x.write(wrappedX ? renderX : x);
                                    prevPosition.y.write(wrappedY ? renderY : y);
                                    position.x.write(renderX);
                                    position.y.write(renderY);
                                });
                        },
                    }),
                );
            },
        });
    }

    horizontalScene = createFlowScene({
        id: "demo.flow.horizontal",
        label: "horizontal scene - press Space",
        color: "#1f6feb",
        direction: "horizontal",
        nextScene: () => verticalScene,
    });

    verticalScene = createFlowScene({
        id: "demo.flow.vertical",
        label: "vertical scene - press Space",
        color: "#d29922",
        direction: "vertical",
        nextScene: () => horizontalScene,
    });

    game = createGame({
        canvas: display.canvas,
        display: {
            mode: "fixed",
            size: { w: WIDTH, h: HEIGHT },
        },
        initialScene: horizontalScene,
        debug: true,
    });

    await game.start();
};
