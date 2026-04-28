import type { ActiveScene, SceneInstanceId } from "../Scene.types";

export type SceneStack<P, C, R> = Readonly<{
    activeScenes(): ReadonlyArray<ActiveScene<P, C, R>>;
    has(instanceId: SceneInstanceId): boolean;
    push(active: ActiveScene<P, C, R>): void;
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

    function has(instanceId: SceneInstanceId) {
        const exists = ids.has(instanceId);
        if (exists && debug) {
            throw new Error(
                `[SceneStack] SceneInstanceId ${instanceId} already active`,
            );
        }
        return exists;
    }

    function push(active: ActiveScene<P, C, R>): boolean {
        if (!active) {
            if (debug) throw new Error("[SceneStack] push requires scene");
            return false;
        }
        if (has(active.instanceId)) {
            return false; // ignore in non-debug (has will throw if in debug)
        }
        stack.push(active);
        ids.add(active.instanceId);
        snapshot = [...stack];
        return true;
    }

    function pop() {
        const active = stack.pop();
        ids.delete(active?.instanceId ?? "");
        snapshot = [...stack];
        return active;
    }

    function clear() {
        snapshot.length = 0;
        stack.length = 0;
        ids.clear();
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
        has,
        size,
        clear,
    };
}
