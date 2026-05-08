import type { SceneInstanceId } from "../Scene.types";
import type { MountedScene } from "../Scene.runtime.types";

export type SceneStack<C, R> = Readonly<{
    activeScenes(): ReadonlyArray<MountedScene<C, R>>;
    push(
        instanceId: SceneInstanceId,
        createActive: () => MountedScene<C, R>,
    ): MountedScene<C, R> | undefined;
    pop(): MountedScene<C, R> | undefined;
    clear(): void;
    size(): number;
}>;

export function createSceneStack<C, R>(
    debug: boolean = false,
): SceneStack<C, R> {
    const stack: MountedScene<C, R>[] = [];
    const ids: Set<SceneInstanceId> = new Set();

    let snapshot: MountedScene<C, R>[] = [];

    function push(
        instanceId: SceneInstanceId,
        createActive: () => MountedScene<C, R>,
    ): MountedScene<C, R> | undefined {
        if (ids.has(instanceId)) {
            if (debug) {
                throw new Error(
                    `SceneStack.push: scene instance ${instanceId} is already active`,
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

    function activeScenes(): ReadonlyArray<MountedScene<C, R>> {
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
