import { type EnginePlatform } from "../../../types/patform";

export type LoopAnyCallback = () => void;
export type LoopFixedCallback = (dt: number) => void;
export type LoopFrameCallback = (alpha: number) => void;

export type LoopPlatform = Pick<EnginePlatform, "requestFrame" | "cancelFrame">;

export type LoopConfig = {
    onBeginUpdate: LoopAnyCallback;
    onInput: LoopAnyCallback;
    onFixedUpdate: LoopFixedCallback;
    onPreRender: LoopFrameCallback;
    onRender: LoopFrameCallback;

    platform?: LoopPlatform;
    fixedStepMs?: number;
    maxUpdatesPerFrame?: number;
    debug?: boolean;
};
