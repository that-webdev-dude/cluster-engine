import type { SceneManagerService } from "../../managers/scene";
import type { WorldManagerService } from "../../managers/world";
import type { RenderService, RenderTargetInfo } from "../../services/render";
import type { GameCtx, GameRun } from "../service/Game.types";
import { extractRenderFrameInput } from "./RenderExtraction.module";

export type GameFramePipelineDeps = Readonly<{
    sceneManager: SceneManagerService<GameCtx, GameRun>;
    worldManager: WorldManagerService;
    render: RenderService;
    createGameCtx(scopeId: string): GameCtx;
    createRenderTarget(): RenderTargetInfo;
    debug?: boolean;
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
        render: renderService,
        createGameCtx,
        createRenderTarget,
        debug,
    } = deps;
    let hasPreparedRenderFrame = false;

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
        renderService.prepare(
            extractRenderFrameInput({
                alpha,
                target: createRenderTarget(),
                storeIds: sceneManager.view.stack.instanceIds,
                world: worldManager,
                debug,
            }),
        );
        hasPreparedRenderFrame = true;
    }

    function render(_alpha: number): void {
        if (!hasPreparedRenderFrame) return;

        renderService.execute();
        hasPreparedRenderFrame = false;
    }

    return Object.freeze({
        beginUpdate,
        input,
        update,
        prepareRender,
        render,
    });
}
