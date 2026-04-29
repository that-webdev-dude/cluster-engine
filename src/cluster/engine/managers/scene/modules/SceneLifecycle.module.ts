import type { Scheduler } from "./Scheduler.module";
import type { System } from "../../../types/system";
import type { Scene, SceneCtx, SceneInstanceId } from "../Scene.types";
import type { MountedScene } from "../Scene.runtime.types";
import { resolveSceneInstanceId } from "../tools";

export type SceneLifecycleModule<P, C, R> = Readonly<{
    mount(scene: Scene<P, C, R>): MountedScene<P, C, R>;
    unmount(active: MountedScene<P, C, R>): void;
}>;

export function createSceneLifecycleModule<P, C, R>(config: {
    scheduler: Scheduler<P, C, R>;
}): SceneLifecycleModule<P, C, R> {
    const { scheduler } = config;

    function registerSystems(
        instanceId: SceneInstanceId,
        ...systems: readonly System<P, C, R>[]
    ) {
        for (const system of systems) {
            scheduler.register({
                ownerId: instanceId,
                system,
            });
        }
    }

    function mount(scene: Scene<P, C, R>): MountedScene<P, C, R> {
        const instanceId = resolveSceneInstanceId(scene);
        const ctx: SceneCtx<P, C, R> = {
            add(...systems) {
                registerSystems(instanceId, ...systems);
            },
        };

        const cleanup = scene.onMount?.(ctx);

        return {
            scene,
            instanceId,
            policy: scene.policy,
            cleanup: typeof cleanup === "function" ? cleanup : undefined,
            definitionId: scene.id,
        };
    }

    function unmount(active: MountedScene<P, C, R>): void {
        active.cleanup?.();
        scheduler.unregister(active.instanceId);
    }

    return {
        mount,
        unmount,
    };
}
