import type {
    GameAuthoredScene,
    GameCtx,
    GameDebugView,
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
import { createLoop } from "../../services/loop";
import { createAuthoredSceneAdapter } from "../modules/AuthoredSceneAdapter.module";
import { createGameFramePipeline } from "../modules/GameFramePipeline.module";

export type GameConfig = {
    canvas: HTMLCanvasElement | OffscreenCanvas;
    display?: DisplayOptions;
    input?: InputOptions;
    initialScene: GameAuthoredScene;
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

    const sceneCommands: GameSceneCommands = {
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
    } as const;

    if (config.initialScene) {
        sceneManager.commands.request.set(
            authoredSceneAdapter.toRuntimeScene(config.initialScene),
        );
    }

    const worldCommands: GameWorldCommands = {
        request: {
            spawn(storeId: string, entity: Entity) {
                worldManager.commands.request.spawn(storeId, entity);
            },
            destroy(storeId: string, entityId: string) {
                worldManager.commands.request.destroy(storeId, entityId);
            },
            clear() {
                worldManager.commands.request.clear();
            },
        },
    } as const;

    const debugView: GameDebugView = Object.freeze({
        get sceneStack() {
            return sceneManager.view.stack;
        },
        get world() {
            return worldManager.view.debug;
        },
    });

    let frameGameCtx: GameCtx | undefined;

    const createGameCtx = (): GameCtx => {
        return {
            display: display.view,
            input: input.view,
            scene: sceneCommands,
            world: {
                query(storeId: string, componentNames: readonly string[]) {
                    return worldManager.query(storeId, componentNames);
                },
                commands: worldCommands,
            },
        };
    };

    const framePipeline = createGameFramePipeline({
        sceneManager,
        worldManager,
        createGameCtx,
    });
    function runBeginUpdate() {
        display.latch();
        input.latch(display.view);
        frameGameCtx = framePipeline.beginUpdate();
    }
    function runInput() {
        if (!frameGameCtx) return;
        framePipeline.input(frameGameCtx);
    }
    function runFixedUpdate(dt: number) {
        if (!frameGameCtx) return;
        framePipeline.fixedUpdate(frameGameCtx, dt);
    }
    function runPreRender(alpha: number) {
        if (!frameGameCtx) return;
        framePipeline.preRender(frameGameCtx, alpha);
    }
    function runRender(alpha: number) {
        framePipeline.render(alpha);
    }
    const loop = createLoop({
        onBeginUpdate: runBeginUpdate,
        onInput: runInput,
        onFixedUpdate: runFixedUpdate,
        onPreRender: runPreRender,
        onRender: runRender,
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
