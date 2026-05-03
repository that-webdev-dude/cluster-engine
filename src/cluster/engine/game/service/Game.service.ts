import {
    createLifecycle,
    type LifecycleLivePhase,
    type LifecycleActivePhase,
} from "../../controllers/Lifecycle.controller";
import { createSceneManager, Scene } from "../../managers/scene";
import { createWorldManager, Entity } from "../../managers/world";
import { createLoop } from "../../services/loop";
import type { System } from "../../types/system";

/**
 * ----------------------------------------------------------------
 * service specific types
 * ----------------------------------------------------------------
 */

export type GameSceneCommands = {
    request: {
        set(scene: GameAuthoredScene): void;
        push(scene: GameAuthoredScene): void;
        pop(): void;
    };
};

export type GameWorldCommands = {
    request: {
        spawn(entity: Entity): void;
        destroy(entityId: string): void;
        clear(): void;
    };
};

export type GameCtx = {
    scene: GameSceneCommands;
    world: GameWorldCommands;
};

export type GameRun = number;

export type GameEntity = Entity;

export type GameSystem = System<GameCtx, GameRun>;

export type GameRuntimeScene = Scene<GameCtx, GameRun>;

export type GameAuthoredSceneSetupCtx = {
    addSystems(...systems: readonly GameSystem[]): void;
    addEntities(...entities: readonly GameEntity[]): void;
};

export type GameAuthoredScene = {
    id: string;
    // options?: scenePolicy here
    setup(sceneSetupCtx: GameAuthoredSceneSetupCtx): void | (() => void);
};

export type GamePlatform = {
    window?: Window;
    document?: Document;
    requestFrame?: (cb: FrameRequestCallback) => number;
    cancelFrame?: (id: number) => void;
};

/**
 * ----------------------------------------------------------------
 * service implementation
 * ----------------------------------------------------------------
 */
export type GameConfig = {
    canvas: HTMLCanvasElement | OffscreenCanvas;
    // service?: ServiceOptions;
    // ...
    initialScene: GameAuthoredScene;
    platform?: GamePlatform;
    debug?: boolean;
};

export type Game = {
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    dispose(): Promise<boolean>;
};

export function createGame(config: GameConfig): Game {
    const { platform, debug = false } = config;

    const sceneManager = createSceneManager<GameCtx, GameRun>({ debug });
    const worldManager = createWorldManager({ debug });

    function toRuntimeScene(
        authoredScene: GameAuthoredScene,
    ): GameRuntimeScene {
        const instanceId = authoredScene.id;
        return {
            id: authoredScene.id,
            instanceId,
            onMount(runtimeCtx) {
                return authoredScene.setup({
                    addSystems(...systems) {
                        runtimeCtx.addSystems(...systems);
                    },
                    addEntities(...entities) {
                        for (const entity of entities) {
                            worldManager.commands.request.spawn(
                                instanceId,
                                entity,
                            );
                        }
                    },
                });
            },
        };
    }

    function scopedWorldCommands(storeId: string): GameWorldCommands {
        return {
            request: {
                spawn(entity: Entity) {
                    worldManager.commands.request.spawn(storeId, entity);
                },
                destroy(entityId: string) {
                    worldManager.commands.request.destroy(storeId, entityId);
                },
                clear() {
                    worldManager.commands.request.clear();
                },
            },
        } as const;
    }

    function createScopedWorldCommands() {
        let storeId = "";
        const commands = {
            request: {
                spawn(entity: Entity) {
                    worldManager.commands.request.spawn(storeId, entity);
                },
                destroy(entityId: string) {
                    worldManager.commands.request.destroy(storeId, entityId);
                },
                clear() {
                    worldManager.commands.request.clear();
                },
            },
        } as const;

        return {
            bind(newStoreId: string) {
                storeId = newStoreId;
            },
            commands,
        };
    }

    const sceneCommands: GameSceneCommands = {
        request: {
            set(scene: GameAuthoredScene) {
                sceneManager.commands.request.set(toRuntimeScene(scene));
            },
            push(scene: GameAuthoredScene) {
                sceneManager.commands.request.push(toRuntimeScene(scene));
            },
            pop() {
                sceneManager.commands.request.pop();
            },
        },
    } as const;

    if (config.initialScene) {
        sceneManager.commands.request.set(toRuntimeScene(config.initialScene));
    }

    const worldCommands = createScopedWorldCommands();

    let frameGameCtx: GameCtx | undefined;

    // if (config.initialScene) {
    //     sceneManager.commands.set(config.initialScene);
    // }

    const createGameCtx = (sceneId: string): GameCtx => {
        worldCommands.bind(sceneId);
        return {
            scene: sceneCommands,
            world: worldCommands.commands,
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
    }

    function runFixedUpdate(dt: number) {
        for (const sceneId of sceneManager.view.fixedUpdate.instanceIds) {
            const ctx = createGameCtx(sceneId);
            sceneManager.execute({
                ctx,
                run: dt,
                pass: "fixedUpdate",
            });
        }
        for (const sceneId of sceneManager.view.input.instanceIds) {
            const ctx = createGameCtx(sceneId);
            sceneManager.execute({
                ctx,
                run: dt,
                pass: "input",
            });
        }
    }

    function runPreRender(alpha: number) {
        for (const sceneId of sceneManager.view.preRender.instanceIds) {
            const ctx = createGameCtx(sceneId);
            sceneManager.execute({
                ctx,
                run: alpha,
                pass: "preRender",
            });
        }
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
        await loop.stop();
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
