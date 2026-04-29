import { System } from "../../types/system";

export type SceneDefinitionId = string;

export type SceneInstanceId = string;

export type ScenePolicy = {
    blocksUpdateBelow?: boolean;
    capturesInput?: boolean;
};

export type SceneCtx<P, C, R> = {
    add(...systems: readonly System<P, C, R>[]): void;
};

export type SceneMountCallback<P, C, R> = (
    ctx: SceneCtx<P, C, R>,
) => void | (() => void);

export type Scene<P, C, R> = {
    // Stable authoring definition id.
    id: SceneDefinitionId;
    // Optional runtime instance id. Defaults to the definition id, which preserves
    // singleton-by-definition behavior until authors opt into distinct instances.
    policy?: ScenePolicy;
    onMount?: SceneMountCallback<P, C, R>;
    instanceId?: SceneInstanceId;
};
