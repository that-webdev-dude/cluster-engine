import { describe, expect, it } from "vitest";
import {
    createFakeWebGl2,
    createFakeWebGpu,
} from "../../../testing/FakeWebGl2.test-utils";
import { createPipelineLibrary } from "./PipelineLibrary.service";
import type { PipelineDescriptor } from "./PipelineLibrary.types";

const DESC: PipelineDescriptor = {
    shaderFamily: "solid-2d",
    passKey: "main",
    materialKey: "solid",
    primitive: "triangles",
    blend: "opaque",
    vertexLayoutKey: "position-color-2d",
};
const DESC_KEY =
    "render.pipeline|pass=main|shader=solid-2d|material=solid|primitive=triangles|blend=opaque|layout=position-color-2d";
const SOLID_INSTANCE_DESC: PipelineDescriptor = {
    ...DESC,
    materialKey: "solid:quad-instance",
    vertexLayoutKey: "quad-solid-instance-2d",
};
const SOLID_INSTANCE_DESC_KEY =
    "render.pipeline|pass=main|shader=solid-2d|material=solid%3Aquad-instance|primitive=triangles|blend=opaque|layout=quad-solid-instance-2d";
const TEXTURED_INSTANCE_DESC: PipelineDescriptor = {
    shaderFamily: "textured-2d",
    passKey: "main",
    materialKey: "textured:quad-instance",
    primitive: "triangles",
    blend: "alpha",
    vertexLayoutKey: "quad-textured-instance-2d",
};
const TEXTURED_INSTANCE_DESC_KEY =
    "render.pipeline|pass=main|shader=textured-2d|material=textured%3Aquad-instance|primitive=triangles|blend=alpha|layout=quad-textured-instance-2d";

describe("PipelineLibraryService", () => {
    it("normalizes descriptor intent into a stable backend-neutral key", async () => {
        const gl = createFakeWebGl2();
        const pipelines = createPipelineLibrary({});
        await pipelines.start();

        const pipeline = pipelines.getWebGl2Pipeline({
            desc: { ...DESC, materialKey: " solid " },
            gl,
        });
        const record = pipelines.peekPipeline(DESC_KEY);

        expect(pipeline).toBeDefined();
        expect(record).toMatchObject({
            key: DESC_KEY,
            backend: "webgl2",
            invalidated: false,
        });
        expect(gl.shaderSource).toHaveBeenCalledWith(
            expect.any(Object),
            expect.stringContaining("#version 300 es"),
        );

        await pipelines.dispose();
    });

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

    it("compiles and caches WebGPU pipelines by descriptor key", async () => {
        const webGpu = createFakeWebGpu();
        const pipelines = createPipelineLibrary({});
        await pipelines.start();
        pipelines.sync({ gfxBackend: "webgpu", gfxStatus: "ok" });

        const first = pipelines.getWebGpuPipeline({
            desc: DESC,
            device: webGpu.device,
            format: "bgra8unorm",
        });
        const second = pipelines.getWebGpuPipeline({
            desc: DESC,
            device: webGpu.device,
            format: "bgra8unorm",
        });
        const record = pipelines.peekPipeline(DESC_KEY);

        expect(first).toEqual(second);
        expect(record).toMatchObject({
            key: DESC_KEY,
            backend: "webgpu",
            invalidated: false,
        });
        expect(webGpu.device.createShaderModule).toHaveBeenCalledWith(
            expect.objectContaining({
                code: expect.stringContaining("@vertex"),
            }),
        );
        expect(webGpu.device.createRenderPipeline).toHaveBeenCalledTimes(1);

        await pipelines.dispose();
    });

    it("uses distinct cache keys for WebGL2 quad instance descriptors", async () => {
        const gl = createFakeWebGl2();
        const pipelines = createPipelineLibrary({});
        await pipelines.start();

        const solid = pipelines.getWebGl2Pipeline({
            desc: SOLID_INSTANCE_DESC,
            gl,
        });
        const textured = pipelines.getWebGl2Pipeline({
            desc: TEXTURED_INSTANCE_DESC,
            gl,
        });

        expect(solid).toBeDefined();
        expect(textured).toBeDefined();
        expect(solid?.handle).not.toEqual(textured?.handle);
        expect(pipelines.peekPipeline(SOLID_INSTANCE_DESC_KEY)).toMatchObject({
            key: SOLID_INSTANCE_DESC_KEY,
            backend: "webgl2",
            invalidated: false,
        });
        expect(pipelines.peekPipeline(TEXTURED_INSTANCE_DESC_KEY)).toMatchObject({
            key: TEXTURED_INSTANCE_DESC_KEY,
            backend: "webgl2",
            invalidated: false,
        });
        expect(gl.shaderSource).toHaveBeenCalledWith(
            expect.any(Object),
            expect.stringContaining("a_unit"),
        );

        await pipelines.dispose();
    });

    it("uses distinct cache keys for WebGPU quad instance descriptors", async () => {
        const webGpu = createFakeWebGpu();
        const pipelines = createPipelineLibrary({});
        await pipelines.start();
        pipelines.sync({ gfxBackend: "webgpu", gfxStatus: "ok" });

        const solid = pipelines.getWebGpuPipeline({
            desc: SOLID_INSTANCE_DESC,
            device: webGpu.device,
            format: "bgra8unorm",
        });
        const textured = pipelines.getWebGpuPipeline({
            desc: TEXTURED_INSTANCE_DESC,
            device: webGpu.device,
            format: "bgra8unorm",
        });

        expect(solid).toBeDefined();
        expect(textured).toBeDefined();
        expect(solid?.handle).not.toEqual(textured?.handle);
        expect(pipelines.peekPipeline(SOLID_INSTANCE_DESC_KEY)).toMatchObject({
            key: SOLID_INSTANCE_DESC_KEY,
            backend: "webgpu",
            invalidated: false,
        });
        expect(pipelines.peekPipeline(TEXTURED_INSTANCE_DESC_KEY)).toMatchObject({
            key: TEXTURED_INSTANCE_DESC_KEY,
            backend: "webgpu",
            invalidated: false,
        });
        expect(webGpu.device.createRenderPipeline).toHaveBeenCalledWith(
            expect.objectContaining({
                vertex: expect.objectContaining({
                    buffers: expect.arrayContaining([
                        expect.objectContaining({ stepMode: "instance" }),
                    ]),
                }),
            }),
        );

        await pipelines.dispose();
    });

    it("invalidates cached WebGPU pipelines after backend loss", async () => {
        const webGpu = createFakeWebGpu();
        const pipelines = createPipelineLibrary({});
        await pipelines.start();
        pipelines.sync({ gfxBackend: "webgpu", gfxStatus: "ok" });

        pipelines.getWebGpuPipeline({
            desc: DESC,
            device: webGpu.device,
            format: "bgra8unorm",
        });
        pipelines.sync({ gfxBackend: "webgpu", gfxStatus: "lost" });
        pipelines.sync({ gfxBackend: "webgpu", gfxStatus: "ok" });
        pipelines.getWebGpuPipeline({
            desc: DESC,
            device: webGpu.device,
            format: "bgra8unorm",
        });

        expect(webGpu.device.createRenderPipeline).toHaveBeenCalledTimes(2);

        await pipelines.dispose();
    });

    it("returns undefined for unsupported WebGL2 descriptors in production and throws in debug", async () => {
        const gl = createFakeWebGl2();
        const unsupported = {
            ...DESC,
            shaderFamily: "unsupported-2d",
        } as unknown as PipelineDescriptor;
        const pipelines = createPipelineLibrary({});
        await pipelines.start();

        expect(
            pipelines.getWebGl2Pipeline({ desc: unsupported, gl }),
        ).toBeUndefined();

        const debugPipelines = createPipelineLibrary({ debug: true });
        await debugPipelines.start();
        expect(() =>
            debugPipelines.getWebGl2Pipeline({ desc: unsupported, gl }),
        ).toThrow(
            "PipelineLibraryService: unsupported WebGL2 pipeline descriptor - shaderFamily=unsupported-2d, vertexLayoutKey=position-color-2d",
        );

        await pipelines.dispose();
        await debugPipelines.dispose();
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
