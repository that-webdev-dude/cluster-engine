// TODO - rename this file to platform.ts if its responsibility stays stable

export type EnginePlatform = {
    window?: Window;
    document?: Document;
    requestFrame?: (cb: FrameRequestCallback) => number;
    cancelFrame?: (id: number) => void;
};
