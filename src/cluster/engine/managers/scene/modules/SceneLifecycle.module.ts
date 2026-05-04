import type { Scheduler } from "./Scheduler.module";
import type { System } from "../../../systems";
import type { Scene, SceneCtx, SceneInstanceId } from "../Scene.types";
import type { MountedScene } from "../Scene.runtime.types";
import { resolveSceneInstanceId } from "../tools";

export type SceneLifecycleModule<C, R> = Readonly<{
    mount(scene: Scene<C, R>): MountedScene<C, R>;
    unmount(active: MountedScene<C, R>): void;
}>;

export function createSceneLifecycleModule<C, R>(config: {
    scheduler: Scheduler<C, R>;
}): SceneLifecycleModule<C, R> {
    const { scheduler } = config;

    function registerSystems(
        instanceId: SceneInstanceId,
        ...systems: readonly System<C, R>[]
    ) {
        for (const system of systems) {
            scheduler.register({
                ownerId: instanceId,
                system,
            });
        }
    }

    function mount(scene: Scene<C, R>): MountedScene<C, R> {
        const instanceId = resolveSceneInstanceId(scene);
        const ctx: SceneCtx<C, R> = {
            addSystems(...systems) {
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

    function unmount(active: MountedScene<C, R>): void {
        active.cleanup?.();
        scheduler.unregister(active.instanceId);
    }

    return {
        mount,
        unmount,
    };
}
