import { Scene, SceneInstanceId } from "../Scene.types";

export function resolveSceneInstanceId<C, R>(
    scene: Scene<C, R>,
): SceneInstanceId {
    return scene.instanceId ?? scene.id;
}
