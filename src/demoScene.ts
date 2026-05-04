import { createSceneManager } from "./cluster/engine/managers/scene/Scene.manager";
import type { Scene } from "./cluster/engine/managers/scene/Scene.types";
import type { SceneExecPass } from "./cluster/engine/managers/scene/service/SceneManager.types";
import type { System } from "./cluster/engine/types/system";

type DemoSceneCtx = {
    log: string[];
};

type DemoSceneRun = number;

function createDemoSystem(
    id: string,
    phase: SceneExecPass,
): System<DemoSceneCtx, DemoSceneRun> {
    return {
        id,
        phase,
        order: 0,
        group: "default",
        groupOrder: 0,
        execute(ctx, run) {
            ctx.log.push(`${id}:${run}`);
        },
    };
}

export default async () => {
    const sceneManager = createSceneManager<DemoSceneCtx, DemoSceneRun>({
        debug: true,
    });
    const ctx: DemoSceneCtx = { log: [] };
    let mountCount = 0;
    let cleanupCount = 0;

    const scene: Scene<DemoSceneCtx, DemoSceneRun> = {
        id: "demo.scene",
        instanceId: "demo.scene#1",
        onMount(sceneCtx) {
            mountCount += 1;
            sceneCtx.addSystems(
                createDemoSystem("demo.scene.input", "input"),
                createDemoSystem("demo.scene.fixedUpdate", "fixedUpdate"),
                createDemoSystem("demo.scene.preRender", "preRender"),
            );

            return () => {
                cleanupCount += 1;
            };
        },
    };

    await sceneManager.start();

    sceneManager.commands.request.push(scene);
    sceneManager.execute({ pass: "fixedUpdate", ctx, run: 16 });

    const queuedExecutionCount = ctx.log.length;

    sceneManager.flush();
    const mountedMetrics = {
        rev: sceneManager.view.rev,
        changed: sceneManager.view.changed,
        stackInstanceIds: sceneManager.view.stack.instanceIds,
        inputWindow: sceneManager.view.input,
        fixedUpdateWindow: sceneManager.view.fixedUpdate,
        preRenderWindow: sceneManager.view.preRender,
    };

    sceneManager.execute({ pass: "input", ctx, run: 1 });
    sceneManager.execute({ pass: "fixedUpdate", ctx, run: 16 });
    sceneManager.execute({ pass: "preRender", ctx, run: 0.5 });

    sceneManager.commands.request.pop();
    sceneManager.flush();

    console.log("Scene manager demo metrics", {
        rev: sceneManager.view.rev,
        changed: sceneManager.view.changed,
        queuedExecutionCount,
        mountCount,
        cleanupCount,
        mountedMetrics,
        postPopStackInstanceIds: sceneManager.view.stack.instanceIds,
        executedSystems: ctx.log,
        sceneCreated: mountCount === 1,
        sceneUnmounted: cleanupCount === 1,
        queuedSceneSkippedBeforeFlush: queuedExecutionCount === 0,
    });
};
