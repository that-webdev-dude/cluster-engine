import type { GfxRuntime } from "../backend/gfxBackend";
import type { GpuResourceService } from "../backend/gpuResource";
import type { PipelineLibraryService } from "../backend/pipelineLibrary";
import type { Render2DPreparedFrame } from "./Render2DPrepare.module";
import type { RenderFrameStats, RenderSubmitResult } from "../service/Render.types";
import { createWebGl2Submitter } from "./submitters/WebGl2Submitter.module";
import { createWebGpuSubmitter } from "./submitters/WebGpuSubmitter.module";

export type SubmitFrameModule = Readonly<{
    submit(frame: Render2DPreparedFrame | undefined): SubmitFrameReport;
}>;

export type SubmitFrameReport = Readonly<{
    result: RenderSubmitResult;
    metrics: SubmitFrameMetrics;
}>;

export type SubmitFrameMetrics = Pick<
    RenderFrameStats,
    | "drawCallCount"
    | "vertexCount"
    | "skippedResourceCount"
    | "fallbackResourceCount"
>;

export type SubmitFrameConfig = Readonly<{
    getRuntime(): GfxRuntime | undefined;
    gpuResource: GpuResourceService;
    pipelineLibrary: PipelineLibraryService;
}>;

const EMPTY_SUBMIT_METRICS: SubmitFrameMetrics = Object.freeze({
    drawCallCount: 0,
    vertexCount: 0,
    skippedResourceCount: 0,
    fallbackResourceCount: 0,
});

export function createSubmitFrame(config: SubmitFrameConfig): SubmitFrameModule {
    const webGl2Submitter = createWebGl2Submitter({
        gpuResource: config.gpuResource,
        pipelineLibrary: config.pipelineLibrary,
    });
    const webGpuSubmitter = createWebGpuSubmitter({
        gpuResource: config.gpuResource,
        pipelineLibrary: config.pipelineLibrary,
    });

    return Object.freeze({
        submit(frame: Render2DPreparedFrame | undefined): SubmitFrameReport {
            if (!frame) {
                return {
                    result: { status: "no-frame" },
                    metrics: EMPTY_SUBMIT_METRICS,
                };
            }

            const runtime = config.getRuntime();
            if (!runtime) {
                return {
                    result: { status: "skipped", reason: "no-submitter" },
                    metrics: EMPTY_SUBMIT_METRICS,
                };
            }

            if (runtime.backend === "webgl2") {
                return webGl2Submitter.submit(frame, runtime);
            }

            return webGpuSubmitter.submit(frame, runtime);
        },
    });
}
