import { type EnginePlatform } from "../../../types/patform";

export type LoopFrameUpdate = {
    frameDeltaMs: number;
    rawFrameDeltaMs: number;
    fixedStepMs: number;
    updateSteps: number;
    droppedUpdates: boolean;
};

export type LoopFrameRender = {
    alpha: number;
    frameDeltaMs: number;
    rawFrameDeltaMs: number;
};

export type LoopPlatform = Pick<EnginePlatform, "requestFrame" | "cancelFrame">;
export type LoopUpdateCallback = (update: LoopFrameUpdate) => void;
export type LoopRenderCallback = (render: LoopFrameRender) => void;

export type LoopConfig = {
    onFrameUpdate: LoopUpdateCallback;
    onFrameRender: LoopRenderCallback;
    platform?: LoopPlatform;
    fixedStepMs?: number;
    maxUpdatesPerFrame?: number;
    debug?: boolean;
};
