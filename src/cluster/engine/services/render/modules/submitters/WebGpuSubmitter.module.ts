import type { GfxRuntime } from "../../gfxBackend";
import type { Render2DPreparedFrame } from "../Render2DPrepare.module";
import type { SubmitFrameReport, SubmitFrameMetrics } from "../SubmitFrame.module";

export type WebGpuSubmitter = Readonly<{
    submit(
        frame: Render2DPreparedFrame,
        runtime: Extract<GfxRuntime, { backend: "webgpu" }>,
    ): SubmitFrameReport;
}>;

const EMPTY_SUBMIT_METRICS: SubmitFrameMetrics = Object.freeze({
    drawCallCount: 0,
    vertexCount: 0,
    skippedResourceCount: 0,
    fallbackResourceCount: 0,
});

export function createWebGpuSubmitter(): WebGpuSubmitter {
    return Object.freeze({
        submit(): SubmitFrameReport {
            return {
                result: { status: "skipped", reason: "no-submitter" },
                metrics: EMPTY_SUBMIT_METRICS,
            };
        },
    });
}
