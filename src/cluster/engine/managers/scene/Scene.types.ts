import { System } from "../../types/system";

export type SceneDefinitionId = string;

export type SceneInstanceId = string;

export type ScenePolicy = {
    blocksUpdateBelow?: boolean;
    capturesInput?: boolean;
    render?: boolean;
};

export type SceneCtx<P, C, R> = {
    add(...systems: readonly System<P, C, R>[]): void;
};

export type SceneRequestCommands<P, C, R> = {
    // Queues replacement of the active stack and applies it on the next flush.
    set(scene: Scene<P, C, R>): void;
    // Queues activation on the next flush. Duplicate active instance ids are ignored
    // unless debug mode throws. Distinct scene instances can coexist.
    push(scene: Scene<P, C, R>): void;
    // Queues removal of the top active scene and applies it on the next flush.
    pop(): void;
};

export type SceneCommands<P, C, R> = {
    readonly request: SceneRequestCommands<P, C, R>;
};

export type SceneMountCallback<P, C, R> = (
    ctx: SceneCtx<P, C, R>,
) => void | (() => void);

export type Scene<P, C, R> = {
    // Stable authoring definition id.
    id: SceneDefinitionId;
    // Optional runtime instance id. Defaults to the definition id, which preserves
    // singleton-by-definition behavior until authors opt into distinct instances.
    instanceId?: SceneInstanceId;
    policy?: ScenePolicy;
    onMount?: SceneMountCallback<P, C, R>;
    instance?(key?: string): Scene<P, C, R>;
};

export type ActiveScene<P, C, R> = Readonly<{
    scene: Scene<P, C, R>;
    definitionId: SceneDefinitionId;
    instanceId: SceneInstanceId;
    policy?: ScenePolicy;
    cleanup?: () => void;
}>;
