import type {
    Scene,
    SceneDefinitionId,
    SceneInstanceId,
    ScenePolicy,
} from "./Scene.types";

export type MountedScene<P, C, R> = Readonly<{
    scene: Scene<P, C, R>;
    definitionId: SceneDefinitionId;
    instanceId: SceneInstanceId;
    policy?: ScenePolicy;
    cleanup?: () => void;
}>;
