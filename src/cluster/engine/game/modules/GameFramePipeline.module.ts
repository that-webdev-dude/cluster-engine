import type { SceneManagerService } from "../../managers/scene";
import type { WorldManagerService } from "../../managers/world";
import type { GameCtx, GameRun } from "../service/Game.types";

export type GameFramePipelineDeps = Readonly<{
    sceneManager: SceneManagerService<GameCtx, GameRun>;
    worldManager: WorldManagerService;
    createGameCtx(): GameCtx;
}>;

export type GameFramePipeline = Readonly<{
    beginUpdate(): GameCtx;
    input(ctx: GameCtx): void;
    fixedUpdate(ctx: GameCtx, dt: number): void;
    preRender(ctx: GameCtx, alpha: number): void;
    render(alpha: number): void;
}>;

export function createGameFramePipeline(
    deps: GameFramePipelineDeps,
): GameFramePipeline {
    const { sceneManager, worldManager, createGameCtx } = deps;

    function beginUpdate(): GameCtx {
        sceneManager.flush();
        worldManager.flush();
        worldManager.publish();

        return createGameCtx();
    }

    function input(ctx: GameCtx): void {
        sceneManager.execute({
            ctx,
            run: 0,
            pass: "input",
        });
    }

    function fixedUpdate(ctx: GameCtx, dt: number): void {
        sceneManager.execute({
            ctx,
            run: dt,
            pass: "fixedUpdate",
        });
    }

    function preRender(ctx: GameCtx, alpha: number): void {
        sceneManager.execute({
            ctx,
            run: alpha,
            pass: "preRender",
        });
    }

    function render(_alpha: number): void {
        worldManager.flush();
        worldManager.publish();
    }

    return Object.freeze({
        beginUpdate,
        input,
        fixedUpdate,
        preRender,
        render,
    });
}
