import type { SceneManagerService } from "../../managers/scene";
import type { WorldManagerService } from "../../managers/world";
import type {
    GameCtx,
    GamePrepareRender,
    GamePrepareRenderCtx,
    GameRun,
} from "../service/Game.types";

export type GameFramePipelineDeps = Readonly<{
    sceneManager: SceneManagerService<GameCtx, GameRun>;
    worldManager: WorldManagerService;
    createGameCtx(scopeId: string): GameCtx;
    createPrepareRenderCtx(alpha: number): GamePrepareRenderCtx;
    prepareRender?: GamePrepareRender;
}>;

export type GameFramePipeline = Readonly<{
    beginUpdate(): void;
    input(): void;
    update(dt: number): void;
    prepareRender(alpha: number): void;
    render(alpha: number): void;
}>;

export function createGameFramePipeline(
    deps: GameFramePipelineDeps,
): GameFramePipeline {
    const {
        sceneManager,
        worldManager,
        createGameCtx,
        createPrepareRenderCtx,
        prepareRender: runPrepareRender,
    } = deps;

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

    function update(dt: number): void {
        sceneManager.scopedExecute({
            scope: createGameCtx,
            run: dt,
            pass: "update",
        });
    }

    function prepareRender(alpha: number): void {
        worldManager.flush();
        worldManager.publish();
        runPrepareRender?.(createPrepareRenderCtx(alpha));
    }

    function render(_alpha: number): void {
        // Placeholder boundary for the future renderer service.
    }

    return Object.freeze({
        beginUpdate,
        input,
        update,
        prepareRender,
        render,
    });
}
