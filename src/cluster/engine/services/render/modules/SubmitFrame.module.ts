import type { RenderSubmitResult } from "../service/Render.types";

export type SubmitFrameModule = Readonly<{
    submit(hasPreparedFrame: boolean): RenderSubmitResult;
}>;

export function createSubmitFrame(): SubmitFrameModule {
    return Object.freeze({
        submit(hasPreparedFrame: boolean): RenderSubmitResult {
            return hasPreparedFrame
                ? { status: "skipped", reason: "no-submitter" }
                : { status: "no-frame" };
        },
    });
}
