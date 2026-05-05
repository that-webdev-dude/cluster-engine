import type { Scene } from "../Scene.types";
import type {
    SceneExecuteArgs,
    SceneExecWindow,
    SceneExecutionPlan,
    SceneManagerConfig,
    SceneManagerService,
    SceneManagerSnapshot,
    SceneRequestCommands,
    SceneScopedExecuteArgs,
} from "./SceneManager.types";
import type { MountedScene } from "../Scene.runtime.types";
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
        fixedUpdate: EMPTY_STACK_WINDOW,
        preRender: EMPTY_STACK_WINDOW,
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
        sameWindow(left.fixedUpdate, right.fixedUpdate) &&
        sameWindow(left.preRender, right.preRender)
    );
}

function getOrderedInstanceIds(window: SceneExecWindow): readonly string[] {
    if (window.order === "bottomToTop") return window.instanceIds;
    return window.instanceIds.slice().reverse();
}

function createSceneManagerService<C, R>(
    config?: SceneManagerConfig,
): SceneManagerService<C, R> {
    const debug = config?.debug ?? false;
    const snapshot: SceneManagerSnapshot = {
        rev: 0,
        changed: false,
        plan: createEmptyPlan(),
    };

    const commandQueue = createSceneCommandQueueModule<C, R>();
    const executionPlanner = createExecutionPlanner<C, R>();
    const sceneStack = createSceneStack<C, R>(debug);
    const scheduler = createScheduler<C, R>(debug);
    const sceneLifecycle = createSceneLifecycleModule<C, R>({ scheduler });

    function publish(plan: SceneExecutionPlan) {
        const changed = !samePlan(snapshot.plan, plan);
        snapshot.changed = changed;
        if (!changed) return;

        snapshot.rev += 1;
        snapshot.plan = plan;
    }

    function activateScene(scene: Scene<C, R>) {
        sceneStack.push(resolveSceneInstanceId(scene), () =>
            sceneLifecycle.mount(scene),
        );
    }

    function deactivateScene(active?: MountedScene<C, R>) {
        if (!active) return;
        sceneLifecycle.unmount(active);
    }

    function applySet(scene: Scene<C, R>) {
        while (sceneStack.size()) {
            deactivateScene(sceneStack.pop());
        }
        activateScene(scene);
    }

    function applyPush(scene: Scene<C, R>) {
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

    function execute(args: SceneExecuteArgs<C, R>) {
        lifecycle.assertNotDisposed();
        if (!lifecycle.isRunning()) return;

        const window = snapshot.plan[args.pass];
        scheduler.execute({
            ctx: args.ctx,
            run: args.run,
            phase: args.pass,
            scopeIds: getOrderedInstanceIds(window),
        });
    }

    function scopedExecute(args: SceneScopedExecuteArgs<C, R>) {
        lifecycle.assertNotDisposed();
        if (!lifecycle.isRunning()) return;

        const window = snapshot.plan[args.pass];
        scheduler.scopedExecute({
            scope: args.scope,
            run: args.run,
            phase: args.pass,
            scopeIds: getOrderedInstanceIds(window),
        });
    }

    const request: SceneRequestCommands<C, R> = Object.freeze({
        set: commandQueue.set,
        push: commandQueue.push,
        pop: commandQueue.pop,
    });

    return {
        view: createSceneManagerView(() => snapshot),
        start: lifecycle.start,
        stop: lifecycle.stop,
        flush,
        execute,
        scopedExecute,
        dispose: lifecycle.dispose,
        commands: Object.freeze({
            request,
        }),
    };
}

export function createSceneManager<C, R>(
    config?: SceneManagerConfig,
): SceneManagerService<C, R> {
    return createSceneManagerService(config);
}

export type { SceneManagerService } from "./SceneManager.types";
