import type { SceneManagerService } from "../../managers/scene";
import type { WorldManagerService } from "../../managers/world";
import type { GameCtx, GameRun } from "../service/Game.types";

export type GameFramePipelineDeps = Readonly<{
    sceneManager: SceneManagerService<GameCtx, GameRun>;
    worldManager: WorldManagerService;
    createGameCtx(scopeId: string): GameCtx;
}>;

export type GameFramePipeline = Readonly<{
    beginUpdate(): void;
    input(): void;
    fixedUpdate(dt: number): void;
    preRender(alpha: number): void;
    render(alpha: number): void;
}>;

export function createGameFramePipeline(
    deps: GameFramePipelineDeps,
): GameFramePipeline {
    const { sceneManager, worldManager, createGameCtx } = deps;

    function beginUpdate() {
        sceneManager.flush();
        worldManager.flush();
        worldManager.publish();
    }

    function input(): void {
        sceneManager.scopedExecute({
            scope: createGameCtx,
            run: 0,
            pass: "input",
        });
    }

    function fixedUpdate(dt: number): void {
        sceneManager.scopedExecute({
            scope: createGameCtx,
            run: dt,
            pass: "fixedUpdate",
        });
    }

    function preRender(alpha: number): void {
        sceneManager.scopedExecute({
            scope: createGameCtx,
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
