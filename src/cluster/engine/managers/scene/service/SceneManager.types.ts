import type { Scene, SceneInstanceId } from "../Scene.types";

export type SceneExecPass = "input" | "fixedUpdate" | "preRender";

export type SceneExecOrder = "bottomToTop" | "topToBottom";

export type SceneExecWindow = Readonly<{
    instanceIds: readonly SceneInstanceId[];
    order: SceneExecOrder;
}>;

export type SceneSnapshot = Readonly<{
    instanceIds: readonly SceneInstanceId[];
}>;

export type SceneExecutionPlan = Readonly<{
    stack: SceneSnapshot;
    input: SceneExecWindow;
    fixedUpdate: SceneExecWindow;
    preRender: SceneExecWindow;
}>;

export type SceneManagerSnapshot = {
    rev: number;
    changed: boolean;
    plan: SceneExecutionPlan;
};

export type SceneManagerView = Readonly<{
    rev: number;
    changed: boolean;
    stack: SceneSnapshot;
    input: SceneExecWindow;
    fixedUpdate: SceneExecWindow;
    preRender: SceneExecWindow;
}>;

export type SceneExecuteArgs<C, R> = Readonly<{
    pass: SceneExecPass;
    ctx: C;
    run: R;
}>;

export type SceneRequestCommands<C, R> = {
    // Queues replacement of the active stack and applies it on the next flush.
    set(scene: Scene<C, R>): void;
    // Queues activation on the next flush. Duplicate active instance ids are ignored
    // unless debug mode throws. Distinct scene instances can coexist.
    push(scene: Scene<C, R>): void;
    // Queues removal of the top active scene and applies it on the next flush.
    pop(): void;
};

export type SceneCommands<C, R> = {
    readonly request: SceneRequestCommands<C, R>;
};

export type SceneManagerConfig = Readonly<{
    debug?: boolean;
}>;

export type SceneManagerService<C, R> = Readonly<{
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    flush(): void;
    execute(args: SceneExecuteArgs<C, R>): void;
    dispose(): Promise<boolean>;
    view: SceneManagerView;
    commands: SceneCommands<C, R>;
}>;
