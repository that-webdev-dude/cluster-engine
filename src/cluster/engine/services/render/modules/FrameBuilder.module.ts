import type { RenderFrameStats, RenderTargetInfo } from "../service/Render.types";

export type RenderFrameBuilder = Readonly<{
    begin(target: RenderTargetInfo): RenderFrameStats;
    clear(): RenderFrameStats;
}>;

export function createRenderFrameBuilder(): RenderFrameBuilder {
    const emptyStats = (): RenderFrameStats => ({
        passCount: 0,
        commandCount: 0,
        batchCount: 0,
        drawCallCount: 0,
        vertexCount: 0,
        skippedResourceCount: 0,
        fallbackResourceCount: 0,
        textureResourceCount: 0,
    });

    return Object.freeze({
        begin(_target: RenderTargetInfo) {
            return emptyStats();
        },
        clear() {
            return emptyStats();
        },
    });
}
