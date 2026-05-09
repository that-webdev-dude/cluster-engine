import type {
    GameAuthoredScene,
    GameCtx,
    GameDebugView,
    GamePrepareRender,
    GamePrepareRenderCtx,
    GameRun,
    GamePlatform,
    GameSceneCommands,
    GameWorldCommands,
} from "./Game.types";
import {
    createLifecycle,
    type LifecycleLivePhase,
    type LifecycleActivePhase,
} from "../../controllers/Lifecycle.controller";
import { createSceneManager } from "../../managers/scene";
import { createWorldManager, type Entity } from "../../managers/world";
import { createDisplay, type DisplayOptions } from "../../services/display";
import { createInput, type InputOptions } from "../../services/input";
import {
    createLoop,
    LoopFrameRender,
    LoopFrameUpdate,
} from "../../services/loop";
import { createAuthoredSceneAdapter } from "../modules/AuthoredSceneAdapter.module";
import { createGameFramePipeline } from "../modules/GameFramePipeline.module";

export type GameConfig = {
    canvas: HTMLCanvasElement | OffscreenCanvas;
    display?: DisplayOptions;
    input?: InputOptions;
    initialScene: GameAuthoredScene;
    prepareRender?: GamePrepareRender;
    platform?: GamePlatform;
    debug?: boolean;
};

export type Game = {
    readonly debug: GameDebugView;
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    dispose(): Promise<boolean>;
};

export function createGame(config: GameConfig): Game {
    const { canvas, platform, debug = false } = config;

    const display = createDisplay({
        platform,
        canvas,
        debug,
        options: config.display,
    });
    const input = createInput({
        platform,
        canvas,
        debug,
        options: config.input,
    });
    const sceneManager = createSceneManager<GameCtx, GameRun>({ debug });
    const worldManager = createWorldManager({ debug });

    const authoredSceneAdapter = createAuthoredSceneAdapter({
        spawnEntity(storeId: string, entity: Entity) {
            worldManager.commands.request.spawn(storeId, entity);
        },
        clearStore(storeId: string) {
            worldManager.commands.request.clearStore(storeId);
        },
    });

    const debugView: GameDebugView = Object.freeze({
        get sceneStack() {
            return sceneManager.view.stack;
        },
        get world() {
            return worldManager.view.debug;
        },
    });

    if (config.initialScene) {
        sceneManager.commands.request.set(
            authoredSceneAdapter.toRuntimeScene(config.initialScene),
        );
    }

    const createGameCtx = (storeId: string) => {
        return {
            display: display.view,
            input: input.view,
            scene: {
                request: {
                    set(scene: GameAuthoredScene) {
                        sceneManager.commands.request.set(
                            authoredSceneAdapter.toRuntimeScene(scene),
                        );
                    },
                    push(scene: GameAuthoredScene) {
                        sceneManager.commands.request.push(
                            authoredSceneAdapter.toRuntimeScene(scene),
                        );
                    },
                    pop() {
                        sceneManager.commands.request.pop();
                    },
                },
            },
            world: {
                query(componentNames: readonly string[]) {
                    return worldManager.query(storeId, componentNames);
                },
                commands: {
                    request: {
                        spawn(entity: Entity) {
                            worldManager.commands.request.spawn(
                                storeId,
                                entity,
                            );
                        },
                        destroy(entityId: string) {
                            worldManager.commands.request.destroy(
                                storeId,
                                entityId,
                            );
                        },
                        clear() {
                            worldManager.commands.request.clearStore(storeId);
                        },
                    },
                },
            },
        };
    };

    const createPrepareRenderCtx = (alpha: number): GamePrepareRenderCtx => {
        return {
            alpha,
            display: display.view,
            input: input.view,
            sceneStack: sceneManager.view.stack,
            world: worldManager.view.debug,
        };
    };

    const framePipeline = createGameFramePipeline({
        sceneManager,
        worldManager,
        createGameCtx,
        createPrepareRenderCtx,
        prepareRender: config.prepareRender,
    });
    function runBeginUpdate() {
        display.latch();
        input.latch(display.view);
        framePipeline.beginUpdate();
    }
    function runInput() {
        framePipeline.input();
    }
    function runUpdate(dt: number) {
        framePipeline.update(dt);
    }
    function runPrepareRender(alpha: number) {
        framePipeline.prepareRender(alpha);
    }
    function runRender(alpha: number) {
        framePipeline.render(alpha);
    }
    function onFrameUpdate(frame: LoopFrameUpdate) {
        runBeginUpdate();
        runInput();
        for (let i = 0; i < frame.updateSteps; i++) {
            runUpdate(frame.fixedStepMs);
        }
    }
    function onFrameRender(frame: LoopFrameRender) {
        runPrepareRender(frame.alpha);
        runRender(frame.alpha);
    }
    const loop = createLoop({
        onFrameUpdate,
        onFrameRender,
        platform,
        debug,
    });

    async function handleStart() {
        await display.start();
        await input.start();
        await worldManager.start();
        await sceneManager.start();
        await loop.start();
    }
    async function handleStop(_from: LifecycleActivePhase) {
        await loop.stop();
        await sceneManager.stop();
        await worldManager.stop();
        await input.stop();
        await display.stop();
    }
    async function handleDispose(_from: LifecycleLivePhase) {
        await loop.dispose();
        await sceneManager.dispose();
        await worldManager.dispose();
        await input.dispose();
        await display.dispose();
    }
    const lifecycle = createLifecycle({
        tag: "Game",
        onStart: handleStart,
        onStop: handleStop,
        onDispose: handleDispose,
        debug,
    });

    async function start(): Promise<boolean> {
        return lifecycle.start();
    }
    async function stop(): Promise<boolean> {
        return lifecycle.stop();
    }
    async function dispose(): Promise<boolean> {
        return lifecycle.dispose();
    }
    return {
        debug: debugView,
        start,
        stop,
        dispose,
    };
}

export async function startGame(config: GameConfig): Promise<Game> {
    const game = createGame(config);
    await game.start();
    return game;
}
