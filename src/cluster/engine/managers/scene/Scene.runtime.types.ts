import type {
    Scene,
    SceneDefinitionId,
    SceneInstanceId,
    ScenePolicy,
} from "./Scene.types";

export type MountedScene<C, R> = Readonly<{
    scene: Scene<C, R>;
    definitionId: SceneDefinitionId;
    instanceId: SceneInstanceId;
    policy?: ScenePolicy;
    cleanup?: () => void;
}>;
