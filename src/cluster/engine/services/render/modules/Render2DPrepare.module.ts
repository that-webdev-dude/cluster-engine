import type { RenderFrameInput } from "../service/Render.types";

export type Render2DPrepareModule = Readonly<{
    prepare(input: RenderFrameInput): void;
}>;

export function createRender2DPrepare(): Render2DPrepareModule {
    return Object.freeze({
        prepare(_input: RenderFrameInput) {
            return;
        },
    });
}
