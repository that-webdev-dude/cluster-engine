import type { SceneCommands, SceneInstanceId } from "../Scene.types";

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

export type SceneManagerConfig = Readonly<{
    debug?: boolean;
}>;

export type SceneManagerService<P, C, R> = Readonly<{
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    flush(): void;
    dispose(): Promise<boolean>;
    view: SceneManagerView;
    commands: SceneCommands<P, C, R>;
}>;
