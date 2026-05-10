import { describe, expect, it } from "vitest";
import { createRender2DPrepare } from "../Render2DPrepare.module";
import { createWebGpuSubmitter } from "./WebGpuSubmitter.module";
import type { GfxRuntime } from "../../gfxBackend";
import type { RenderFrameInput } from "../../service/Render.types";
import { createFakeWebGpu } from "../../testing/FakeWebGl2.test-utils";

function createInput(layers: RenderFrameInput["layers"]): RenderFrameInput {
    return {
        target: { w: 100, h: 100, dpr: 1 },
        alpha: 1,
        layers,
    };
}

function createWebGpuRuntime(): Extract<GfxRuntime, { backend: "webgpu" }> {
    const webGpu = createFakeWebGpu();
    return {
        backend: "webgpu",
        caps: {},
        adapter: webGpu.adapter,
        device: webGpu.device,
        context: webGpu.context,
        format: "bgra8unorm",
    };
}

describe("createWebGpuSubmitter", () => {
    it("returns unsupported submit semantics without backend work", () => {
        const frame = createRender2DPrepare().prepare(createInput([]));
        const submitter = createWebGpuSubmitter();

        expect(submitter.submit(frame, createWebGpuRuntime())).toEqual({
            result: { status: "skipped", reason: "no-submitter" },
            metrics: {
                drawCallCount: 0,
                vertexCount: 0,
                skippedResourceCount: 0,
                fallbackResourceCount: 0,
            },
        });
    });
});
