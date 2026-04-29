import { System } from "../../types/system";

export type SceneDefinitionId = string;

export type SceneInstanceId = string;

export type ScenePolicy = {
    blocksUpdateBelow?: boolean;
    capturesInput?: boolean;
};

export type SceneCtx<C, R> = {
    add(...systems: readonly System<C, R>[]): void;
};

export type SceneMountCallback<C, R> = (
    ctx: SceneCtx<C, R>,
) => void | (() => void);

export type Scene<C, R> = {
    // Stable authoring definition id.
    id: SceneDefinitionId;
    // Optional runtime instance id. Defaults to the definition id, which preserves
    // singleton-by-definition behavior until authors opt into distinct instances.
    policy?: ScenePolicy;
    onMount?: SceneMountCallback<C, R>;
    instanceId?: SceneInstanceId;
};
