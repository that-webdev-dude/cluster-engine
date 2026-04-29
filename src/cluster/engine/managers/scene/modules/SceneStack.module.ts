import type { SceneInstanceId } from "../Scene.types";
import type { ActiveScene } from "./SceneRuntime.types";

export type SceneStack<P, C, R> = Readonly<{
    activeScenes(): ReadonlyArray<ActiveScene<P, C, R>>;
    push(
        instanceId: SceneInstanceId,
        createActive: () => ActiveScene<P, C, R>,
    ): ActiveScene<P, C, R> | undefined;
    pop(): ActiveScene<P, C, R> | undefined;
    clear(): void;
    size(): number;
}>;

export function createSceneStack<P, C, R>(
    debug: boolean = false,
): SceneStack<P, C, R> {
    const stack: ActiveScene<P, C, R>[] = [];
    const ids: Set<SceneInstanceId> = new Set();

    let snapshot: ActiveScene<P, C, R>[] = [];

    function push(
        instanceId: SceneInstanceId,
        createActive: () => ActiveScene<P, C, R>,
    ): ActiveScene<P, C, R> | undefined {
        if (ids.has(instanceId)) {
            if (debug) {
                throw new Error(
                    `[SceneStack] SceneInstanceId ${instanceId} already active`,
                );
            }
            return undefined;
        }

        const active = createActive();
        stack.push(active);
        ids.add(instanceId);
        snapshot = [...stack];
        return active;
    }

    function pop() {
        const active = stack.pop();
        if (active) ids.delete(active.instanceId);
        snapshot = [...stack];
        return active;
    }

    function clear() {
        stack.length = 0;
        ids.clear();
        snapshot = [];
    }

    function size(): number {
        return stack.length;
    }

    function activeScenes(): ReadonlyArray<ActiveScene<P, C, R>> {
        return snapshot;
    }

    return {
        activeScenes,
        push,
        pop,
        size,
        clear,
    };
}
