import { describe, expect, it } from "vitest";
import { createFakeWebGl2 } from "../../testing/FakeWebGl2.test-utils";
import { createPipelineLibrary } from "./PipelineLibrary.service";
import type { PipelineDescriptor } from "./PipelineLibrary.types";

const DESC: PipelineDescriptor = {
    key: "solid",
    pass: "main",
    shader: {
        vertex: "vertex",
        fragment: "fragment",
    },
};

describe("PipelineLibraryService", () => {
    it("compiles and caches WebGL2 programs by descriptor key", async () => {
        const gl = createFakeWebGl2();
        const pipelines = createPipelineLibrary({});
        await pipelines.start();

        const first = pipelines.getWebGl2Pipeline({ desc: DESC, gl });
        const second = pipelines.getWebGl2Pipeline({ desc: DESC, gl });

        expect(first).toEqual(second);
        expect(gl.createProgram).toHaveBeenCalledTimes(1);

        await pipelines.dispose();
    });

    it("invalidates cached programs after context loss and restore", async () => {
        const firstGl = createFakeWebGl2();
        const restoredGl = createFakeWebGl2();
        const pipelines = createPipelineLibrary({});
        await pipelines.start();

        pipelines.getWebGl2Pipeline({ desc: DESC, gl: firstGl });
        pipelines.sync({ gfxBackend: "webgl2", gfxStatus: "lost" });
        pipelines.sync({ gfxBackend: "webgl2", gfxStatus: "ok" });
        pipelines.getWebGl2Pipeline({ desc: DESC, gl: restoredGl });

        expect(firstGl.deleteProgram).toHaveBeenCalledTimes(1);
        expect(restoredGl.createProgram).toHaveBeenCalledTimes(1);

        await pipelines.dispose();
    });

    it("returns undefined for compile failures in production and throws in debug", async () => {
        const gl = createFakeWebGl2();
        gl.getShaderParameter.mockReturnValue(false);
        const pipelines = createPipelineLibrary({});
        await pipelines.start();

        expect(pipelines.getWebGl2Pipeline({ desc: DESC, gl })).toBeUndefined();

        const debugPipelines = createPipelineLibrary({ debug: true });
        await debugPipelines.start();
        expect(() => debugPipelines.getWebGl2Pipeline({ desc: DESC, gl })).toThrow(
            "PipelineLibraryService: shader compile failed - compile failed",
        );

        await pipelines.dispose();
        await debugPipelines.dispose();
    });
});
