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
        ctx: canvas.getContext("2d") as CanvasRenderingContext2D,
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
        });
    }

    function createParticles(
        sceneId: string,
        direction: "horizontal" | "vertical",
    ) {
        return Array.from({ length: PARTICLE_COUNT }, (_, index) => {
            const speed = 60 + Math.random() * 180;
            return entity(`${sceneId}.particle.${index}`, {
                position: {
                    x: Math.random() * WIDTH,
                    y: Math.random() * HEIGHT,
                },
                velocity: {
                    x: direction === "horizontal" ? speed : 0,
                    y: direction === "vertical" ? speed : 0,
                },
            });
        });
    }

    function createFlowScene(config: {
        id: string;
        label: string;
        color: string;
        direction: "horizontal" | "vertical";
        nextScene: () => GameAuthoredScene;
    }) {
        const particles = createParticles(config.id, config.direction);

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
                            if (gameCtx.input.keyboard.pressed("Space")) {
                                gameCtx.scene.request.set(config.nextScene());
                            }
                        },
                    }),
                    system({
                        id: `${config.id}.move`,
                        phase: "fixedUpdate",
                        execute(gameCtx, dt) {
                            gameCtx.world
                                .query(["position", "velocity"])
                                .forEach((row) => {
                                    const position = row.components.position;
                                    const velocity = row.components.velocity;
                                    const x = position.x.read() as number;
                                    const y = position.y.read() as number;
                                    const vx = velocity.x.read() as number;
                                    const vy = velocity.y.read() as number;

                                    position.x.write(
                                        (x + vx * (dt / 1000)) % WIDTH,
                                    );
                                    position.y.write(
                                        (y + vy * (dt / 1000)) % HEIGHT,
                                    );
                                });
                        },
                    }),
                    system({
                        id: `${config.id}.render`,
                        phase: "preRender",
                        execute(gameCtx) {
                            display.ctx.clearRect(0, 0, WIDTH, HEIGHT);
                            display.ctx.fillStyle = config.color;

                            gameCtx.world.query(["position"]).forEach((row) => {
                                const position = row.components.position;
                                display.ctx.fillRect(
                                    position.x.read() as number,
                                    position.y.read() as number,
                                    PARTICLE_SIZE,
                                    PARTICLE_SIZE,
                                );
                            });

                            display.ctx.fillStyle = "black";
                            display.ctx.font = "16px sans-serif";
                            display.ctx.fillText(config.label, 16, 28);

                            logSceneFlow();
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
