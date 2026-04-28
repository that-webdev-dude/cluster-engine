import type { ActiveScene } from "../Scene.types";
import type {
    SceneExecOrder,
    SceneExecPass,
    SceneExecWindow,
    SceneExecutionPlan,
    SceneSnapshot,
} from "../service/SceneManager.types";

export type ExecutionPlanner<P, C, R> = {
    plan(active: readonly ActiveScene<P, C, R>[]): SceneExecutionPlan;
};

export function createExecutionPlanner<P, C, R>(): ExecutionPlanner<P, C, R> {
    const findCutoffIndex = (
        active: readonly ActiveScene<P, C, R>[],
        predicate: (a: ActiveScene<P, C, R>) => boolean,
    ): number => {
        for (let i = active.length - 1; i >= 0; i--) {
            if (predicate(active[i])) return i;
        }
        return 0;
    };

    const getSnapshot = (
        active: readonly ActiveScene<P, C, R>[],
    ): SceneSnapshot => {
        return { instanceIds: active.map((a) => a.instanceId) };
    };

    const getWindow = (
        pass: SceneExecPass,
        active: readonly ActiveScene<P, C, R>[],
    ): SceneExecWindow => {
        switch (pass) {
            case "input": {
                const order: SceneExecOrder = "topToBottom";
                const start = findCutoffIndex(
                    active,
                    (a) => (a.policy?.capturesInput ?? false) === true,
                );
                return {
                    order,
                    instanceIds: active.slice(start).map((a) => a.instanceId),
                };
            }
            case "update": {
                // Update window: scan top -> bottom for the first blocksUpdateBelow cutoff,
                // but express the resulting window instanceIds in stack order (bottom -> top).
                // Execution traversal for update-pass phases is bottom -> top (e07/e06).
                const order: SceneExecOrder = "bottomToTop";
                const start = findCutoffIndex(
                    active,
                    (a) => (a.policy?.blocksUpdateBelow ?? false) === true,
                );
                return {
                    order,
                    instanceIds: active.slice(start).map((a) => a.instanceId),
                };
            }
            case "render": {
                const order: SceneExecOrder = "bottomToTop";

                // Render window: include only renderable scenes (default true),
                // expressed in stack order (bottom -> top).
                const instanceIds = active // bottom -> top
                    .filter((a) => (a.policy?.render ?? true) === true)
                    .map((a) => a.instanceId);

                return { order, instanceIds };
            }
        }

        // Exhaustiveness fallback (should be unreachable if Phase is kept in sync).
        return { order: "bottomToTop", instanceIds: [] };
    };

    function plan(active: readonly ActiveScene<P, C, R>[]): SceneExecutionPlan {
        return {
            stack: getSnapshot(active),
            input: getWindow("input", active),
            update: getWindow("update", active),
            render: getWindow("render", active),
        };
    }

    return { plan }; // nice and lean
}
