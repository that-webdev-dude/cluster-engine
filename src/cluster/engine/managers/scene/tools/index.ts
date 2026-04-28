import { Scene, SceneInstanceId } from "../Scene.types";

export function resolveSceneInstanceId<P, C, R>(
    scene: Scene<P, C, R>,
): SceneInstanceId {
    return scene.instanceId ?? scene.id;
}
