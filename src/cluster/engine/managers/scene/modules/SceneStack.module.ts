import type { SceneInstanceId } from "../Scene.types";
import type { MountedScene } from "../Scene.runtime.types";

export type SceneStack<P, C, R> = Readonly<{
    activeScenes(): ReadonlyArray<MountedScene<P, C, R>>;
    push(
        instanceId: SceneInstanceId,
        createActive: () => MountedScene<P, C, R>,
    ): MountedScene<P, C, R> | undefined;
    pop(): MountedScene<P, C, R> | undefined;
    clear(): void;
    size(): number;
}>;

export function createSceneStack<P, C, R>(
    debug: boolean = false,
): SceneStack<P, C, R> {
    const stack: MountedScene<P, C, R>[] = [];
    const ids: Set<SceneInstanceId> = new Set();

    let snapshot: MountedScene<P, C, R>[] = [];

    function push(
        instanceId: SceneInstanceId,
        createActive: () => MountedScene<P, C, R>,
    ): MountedScene<P, C, R> | undefined {
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

    function activeScenes(): ReadonlyArray<MountedScene<P, C, R>> {
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
