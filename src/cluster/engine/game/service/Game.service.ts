import {
    GameAuthoredScene,
    GameCtx,
    GameDebugView,
    GameRun,
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
import { createLoop } from "../../services/loop";
import { GamePlatform } from "./Game.types";
import { createAuthoredSceneAdapter } from "../modules/AuthoredSceneAdapter";

export type GameConfig = {
    canvas: HTMLCanvasElement | OffscreenCanvas;
    // service?: ServiceOptions;
    // ...
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
    const { platform, debug = false } = config;

    const sceneManager = createSceneManager<GameCtx, GameRun>({ debug });
    const worldManager = createWorldManager({ debug });
    const authoredSceneAdapter = createAuthoredSceneAdapter({
        spawnEntity(storeId: string, entity: Entity) {
            worldManager.commands.request.spawn(storeId, entity);
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
            scene: sceneCommands,
            world: worldCommands,
        };
    };

    const loop = createLoop({
        onBeginUpdate: runBeginUpdate,
        onFixedUpdate: runFixedUpdate,
        onPreRender: runPreRender,
        onRender: runRender,
        platform,
        debug,
    });

    function runBeginUpdate() {
        sceneManager.flush();
        worldManager.flush();
        worldManager.publish();
        frameGameCtx = createGameCtx();
    }

    function runFixedUpdate(dt: number) {
        if (!frameGameCtx) return;

        sceneManager.execute({
            ctx: frameGameCtx,
            run: dt,
            pass: "input",
        });
        sceneManager.execute({
            ctx: frameGameCtx,
            run: dt,
            pass: "fixedUpdate",
        });
    }

    function runPreRender(alpha: number) {
        if (!frameGameCtx) return;

        sceneManager.execute({
            ctx: frameGameCtx,
            run: alpha,
            pass: "preRender",
        });
    }

    function runRender(_alpha: number) {
        worldManager.flush();
        worldManager.publish();

        // start the render pipeline
    }

    async function handleStart() {
        await worldManager.start();
        await sceneManager.start();
        await loop.start();
    }

    async function handleStop(_from: LifecycleActivePhase) {
        await loop.stop();
        await sceneManager.stop();
        await worldManager.stop();
    }

    async function handleDispose(_from: LifecycleLivePhase) {
        await loop.dispose();
        await sceneManager.dispose();
        await worldManager.dispose();
    }

    const lifecycle = createLifecycle({
        tag: "Game",
        debug,
        onStart: handleStart,
        onStop: handleStop,
        onDispose: handleDispose,
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
