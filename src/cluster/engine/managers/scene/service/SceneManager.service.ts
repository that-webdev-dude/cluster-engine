import type { ActiveScene, Scene, SceneRequestCommands } from "../Scene.types";
import type {
    SceneExecWindow,
    SceneExecutionPlan,
    SceneManagerConfig,
    SceneManagerService,
    SceneManagerSnapshot,
} from "./SceneManager.types";
import {
    createLifecycle,
    type LifecycleLivePhase,
} from "../../../controllers/Lifecycle.controller";
import { createExecutionPlanner } from "../modules/ExecutionPlanner.module";
import { createSceneCommandQueueModule } from "../modules/CommandQueue.module";
import { createSceneLifecycleModule } from "../modules/SceneLifecycle.module";
import { createSceneStack } from "../modules/SceneStack.module";
import { createScheduler } from "../modules/Scheduler.module";
import { createSceneManagerView } from "./SceneManager.view";
import { resolveSceneInstanceId } from "../tools";

const EMPTY_INPUT_WINDOW: SceneExecWindow = Object.freeze({
    order: "topToBottom",
    instanceIds: [],
});

const EMPTY_STACK_WINDOW: SceneExecWindow = Object.freeze({
    order: "bottomToTop",
    instanceIds: [],
});

function createEmptyPlan(): SceneExecutionPlan {
    return {
        stack: { instanceIds: [] },
        input: EMPTY_INPUT_WINDOW,
        update: EMPTY_STACK_WINDOW,
        render: EMPTY_STACK_WINDOW,
    };
}

function sameIds(left: readonly string[], right: readonly string[]): boolean {
    if (left.length !== right.length) return false;
    for (let i = 0; i < left.length; i++) {
        if (left[i] !== right[i]) return false;
    }
    return true;
}

function sameWindow(left: SceneExecWindow, right: SceneExecWindow): boolean {
    return (
        left.order === right.order &&
        sameIds(left.instanceIds, right.instanceIds)
    );
}

function samePlan(
    left: SceneExecutionPlan,
    right: SceneExecutionPlan,
): boolean {
    return (
        sameIds(left.stack.instanceIds, right.stack.instanceIds) &&
        sameWindow(left.input, right.input) &&
        sameWindow(left.update, right.update) &&
        sameWindow(left.render, right.render)
    );
}

function createSceneManagerService<P, C, R>(
    config?: SceneManagerConfig,
): SceneManagerService<P, C, R> {
    const debug = config?.debug ?? false;
    const snapshot: SceneManagerSnapshot = {
        rev: 0,
        changed: false,
        ...createEmptyPlan(),
    };

    const commandQueue = createSceneCommandQueueModule<P, C, R>();
    const executionPlanner = createExecutionPlanner<P, C, R>();
    const sceneStack = createSceneStack<P, C, R>(debug);
    const scheduler = createScheduler<P, C, R>(debug);
    const sceneLifecycle = createSceneLifecycleModule<P, C, R>({ scheduler });

    function publish(plan: SceneExecutionPlan) {
        const changed = !samePlan(snapshot, plan);
        snapshot.changed = changed;
        if (!changed) return;

        snapshot.rev += 1;
        snapshot.stack = plan.stack;
        snapshot.input = plan.input;
        snapshot.update = plan.update;
        snapshot.render = plan.render;
    }

    function activateScene(scene: Scene<P, C, R>) {
        if (sceneStack.has(resolveSceneInstanceId(scene))) return;
        sceneStack.push(sceneLifecycle.mount(scene));
    }

    function deactivateScene(active?: ActiveScene<P, C, R>) {
        if (!active) return;
        sceneLifecycle.unmount(active);
    }

    function applySet(scene: Scene<P, C, R>) {
        while (sceneStack.size()) {
            deactivateScene(sceneStack.pop());
        }
        activateScene(scene);
    }

    function applyPush(scene: Scene<P, C, R>) {
        activateScene(scene);
    }

    function applyPop() {
        deactivateScene(sceneStack.pop());
    }

    function handleDispose(_from: LifecycleLivePhase) {
        commandQueue.clear();

        while (sceneStack.size()) {
            deactivateScene(sceneStack.pop());
        }

        sceneStack.clear();
        publish(createEmptyPlan());
    }

    const lifecycle = createLifecycle({
        tag: "SceneManager",
        debug,
        onDispose: handleDispose,
    });

    function flush() {
        lifecycle.assertNotDisposed();
        if (!lifecycle.isRunning()) return;

        commandQueue.flush({
            set: applySet,
            push: applyPush,
            pop: applyPop,
        });

        publish(executionPlanner.plan(sceneStack.activeScenes()));
    }

    // function execute(ctx: C, phase: P, run: R) {
    //     lifecycle.assertNotDisposed();
    //     if (!lifecycle.isRunning()) return;

    //     scheduler.execute({
    //         phase,
    //         ctx,
    //         run,
    //         scopeIds: snapshot.update.instanceIds,
    //     });
    // }

    function executeInput() {}

    function executeFixedUpdate() {}

    function executePreRender() {}

    const request: SceneRequestCommands<P, C, R> = Object.freeze({
        set: commandQueue.set,
        push: commandQueue.push,
        pop: commandQueue.pop,
    });

    return {
        view: createSceneManagerView(() => snapshot),
        start: lifecycle.start,
        stop: lifecycle.stop,
        flush,
        dispose: lifecycle.dispose,
        commands: Object.freeze({
            request,
        }),
    };
}

export function createSceneManager<P, C, R>(
    config?: SceneManagerConfig,
): SceneManagerService<P, C, R> {
    return createSceneManagerService(config);
}

export type { SceneManagerService } from "./SceneManager.types";
