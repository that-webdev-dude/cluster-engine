import { describe, expect, it } from "vitest";
import {
    createFakeWebGl2,
    createFakeWebGpu,
} from "../../testing/FakeWebGl2.test-utils";
import { createGpuResource } from "./GpuResource.service";

describe("GpuResourceService", () => {
    it("registers texture resources and flushes WebGL2 texture uploads", async () => {
        const gl = createFakeWebGl2();
        const gpuResource = createGpuResource({});
        await gpuResource.start();

        gpuResource.registerTextureResource({
            id: "sprite.player",
            width: 2,
            height: 1,
            data: new Uint8Array([255, 0, 0, 255, 0, 255, 0, 255]),
            minFilter: "nearest",
            magFilter: "nearest",
        });
        gpuResource.flushWebGl2Uploads(gl);

        const binding = gpuResource.resolveWebGl2Texture("sprite.player", gl);

        expect(binding?.fallback).toBe(false);
        expect(gl.createTexture).toHaveBeenCalledTimes(1);
        expect(gl.texImage2D).toHaveBeenCalledWith(
            gl.TEXTURE_2D,
            0,
            gl.RGBA8,
            2,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            expect.any(Uint8Array),
        );
        expect(gl.createSampler).toHaveBeenCalledTimes(1);

        await gpuResource.dispose();
    });

    it("resolves missing texture resources to an explicit fallback texture", async () => {
        const gl = createFakeWebGl2();
        const gpuResource = createGpuResource({});
        await gpuResource.start();

        const binding = gpuResource.resolveWebGl2Texture("missing.sprite", gl);

        expect(binding?.fallback).toBe(true);
        expect(gl.texImage2D).toHaveBeenCalledWith(
            gl.TEXTURE_2D,
            0,
            gl.RGBA8,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            expect.any(Uint8Array),
        );

        await gpuResource.dispose();
    });

    it("invalidates and reuploads retained textures after context restore", async () => {
        const firstGl = createFakeWebGl2();
        const restoredGl = createFakeWebGl2();
        const gpuResource = createGpuResource({});
        await gpuResource.start();

        gpuResource.registerTextureResource({
            id: "sprite.player",
            width: 1,
            height: 1,
            data: new Uint8Array([10, 20, 30, 255]),
        });
        gpuResource.flushWebGl2Uploads(firstGl);

        gpuResource.sync({ gfxStatus: "lost" });
        gpuResource.sync({ gfxStatus: "ok" });
        const binding = gpuResource.resolveWebGl2Texture(
            "sprite.player",
            restoredGl,
        );

        expect(binding?.fallback).toBe(false);
        expect(firstGl.deleteTexture).toHaveBeenCalledTimes(1);
        expect(restoredGl.createTexture).toHaveBeenCalledTimes(1);
        expect(restoredGl.texImage2D).toHaveBeenCalledWith(
            restoredGl.TEXTURE_2D,
            0,
            restoredGl.RGBA8,
            1,
            1,
            0,
            restoredGl.RGBA,
            restoredGl.UNSIGNED_BYTE,
            expect.any(Uint8Array),
        );

        await gpuResource.dispose();
    });

    it("registers texture resources and flushes WebGPU texture uploads", async () => {
        const webGpu = createFakeWebGpu();
        const gpuResource = createGpuResource({});
        await gpuResource.start();

        gpuResource.registerTextureResource({
            id: "sprite.player",
            width: 2,
            height: 1,
            data: new Uint8Array([255, 0, 0, 255, 0, 255, 0, 255]),
            minFilter: "nearest",
            magFilter: "nearest",
        });
        gpuResource.flushWebGpuUploads(webGpu.device);
        const binding = gpuResource.resolveWebGpuTexture({
            resourceId: "sprite.player",
            device: webGpu.device,
            bindGroupLayout: { kind: "layout" },
        });

        expect(binding?.fallback).toBe(false);
        expect(webGpu.device.createTexture).toHaveBeenCalledWith(
            expect.objectContaining({
                format: "rgba8unorm",
                size: { width: 2, height: 1, depthOrArrayLayers: 1 },
            }),
        );
        expect(webGpu.device.queue.writeTexture).toHaveBeenCalledWith(
            { texture: expect.any(Object) },
            expect.any(Uint8Array),
            { bytesPerRow: 8, rowsPerImage: 1 },
            { width: 2, height: 1, depthOrArrayLayers: 1 },
        );
        expect(webGpu.device.createBindGroup).toHaveBeenCalledTimes(1);

        await gpuResource.dispose();
    });

    it("invalidates and reuploads retained WebGPU textures after recovery", async () => {
        const firstWebGpu = createFakeWebGpu();
        const recoveredWebGpu = createFakeWebGpu();
        const gpuResource = createGpuResource({});
        await gpuResource.start();

        gpuResource.registerTextureResource({
            id: "sprite.player",
            width: 1,
            height: 1,
            data: new Uint8Array([10, 20, 30, 255]),
        });
        gpuResource.flushWebGpuUploads(firstWebGpu.device);

        gpuResource.sync({ gfxStatus: "lost" });
        gpuResource.sync({ gfxStatus: "ok" });
        const binding = gpuResource.resolveWebGpuTexture({
            resourceId: "sprite.player",
            device: recoveredWebGpu.device,
            bindGroupLayout: { kind: "layout" },
        });

        expect(binding?.fallback).toBe(false);
        expect(recoveredWebGpu.device.createTexture).toHaveBeenCalledTimes(1);
        expect(recoveredWebGpu.device.queue.writeTexture).toHaveBeenCalledWith(
            { texture: expect.any(Object) },
            expect.any(Uint8Array),
            { bytesPerRow: 4, rowsPerImage: 1 },
            { width: 1, height: 1, depthOrArrayLayers: 1 },
        );

        await gpuResource.dispose();
    });

    it("resolves missing WebGPU texture resources to an explicit fallback texture", async () => {
        const webGpu = createFakeWebGpu();
        const gpuResource = createGpuResource({});
        await gpuResource.start();

        const binding = gpuResource.resolveWebGpuTexture({
            resourceId: "missing.sprite",
            device: webGpu.device,
            bindGroupLayout: { kind: "layout" },
        });

        expect(binding?.fallback).toBe(true);
        expect(webGpu.device.createTexture).toHaveBeenCalledWith(
            expect.objectContaining({
                label: "render.fallbackTexture",
                size: { width: 1, height: 1, depthOrArrayLayers: 1 },
            }),
        );
        expect(webGpu.device.queue.writeTexture).toHaveBeenCalledWith(
            { texture: expect.any(Object) },
            expect.any(Uint8Array),
            { bytesPerRow: 4, rowsPerImage: 1 },
            { width: 1, height: 1, depthOrArrayLayers: 1 },
        );

        await gpuResource.dispose();
    });

    it("releases transient buffers on beginFrame", async () => {
        const gl = createFakeWebGl2();
        const gpuResource = createGpuResource({});
        await gpuResource.start();

        const handle = gpuResource.createBuffer({
            label: "frame.vertices",
            size: 16,
            kind: "vertex",
        });
        gpuResource.stageUpload({
            target: handle,
            byteLength: 16,
            data: new Float32Array([0, 1, 2, 3]),
            usage: "stream-draw",
        });
        gpuResource.flushWebGl2Uploads(gl);
        gpuResource.beginFrame();

        expect(gl.deleteBuffer).toHaveBeenCalledTimes(1);
        expect(gpuResource.getWebGl2Buffer(handle, gl)).toBeUndefined();

        await gpuResource.dispose();
    });

    it("grows and reuses WebGPU frame vertex buffers by layout", async () => {
        const webGpu = createFakeWebGpu();
        const gpuResource = createGpuResource({});
        await gpuResource.start();

        const first = gpuResource.getWebGpuFrameVertexBuffer({
            layout: "position-color-2d",
            device: webGpu.device,
            byteLength: 64,
        });
        const second = gpuResource.getWebGpuFrameVertexBuffer({
            layout: "position-color-2d",
            device: webGpu.device,
            byteLength: 32,
        });
        const grown = gpuResource.getWebGpuFrameVertexBuffer({
            layout: "position-color-2d",
            device: webGpu.device,
            byteLength: 1024,
        });

        expect(first?.buffer).toBe(second?.buffer);
        expect(grown?.buffer).not.toBe(first?.buffer);
        expect(webGpu.device.createBuffer).toHaveBeenCalledTimes(2);

        await gpuResource.dispose();
    });

    it("recreates WebGPU fallback bind groups and frame buffers after recovery", async () => {
        const firstWebGpu = createFakeWebGpu();
        const recoveredWebGpu = createFakeWebGpu();
        const gpuResource = createGpuResource({});
        await gpuResource.start();

        gpuResource.resolveWebGpuTexture({
            resourceId: "missing.sprite",
            device: firstWebGpu.device,
            bindGroupLayout: { kind: "layout" },
        });
        gpuResource.getWebGpuFrameVertexBuffer({
            layout: "position-color-2d",
            device: firstWebGpu.device,
            byteLength: 64,
        });

        gpuResource.sync({ gfxStatus: "lost" });
        gpuResource.sync({ gfxStatus: "ok" });
        gpuResource.resolveWebGpuTexture({
            resourceId: "missing.sprite",
            device: recoveredWebGpu.device,
            bindGroupLayout: { kind: "layout" },
        });
        gpuResource.getWebGpuFrameVertexBuffer({
            layout: "position-color-2d",
            device: recoveredWebGpu.device,
            byteLength: 64,
        });

        expect(firstWebGpu.device.createBindGroup).toHaveBeenCalledTimes(1);
        expect(recoveredWebGpu.device.createBindGroup).toHaveBeenCalledTimes(1);
        expect(firstWebGpu.device.createBuffer).toHaveBeenCalledTimes(1);
        expect(recoveredWebGpu.device.createBuffer).toHaveBeenCalledTimes(1);

        await gpuResource.dispose();
    });

    it("releases backend-native texture, sampler, and buffer objects", async () => {
        const gl = createFakeWebGl2();
        const gpuResource = createGpuResource({});
        await gpuResource.start();

        const texture = gpuResource.registerTextureResource({
            id: "sprite.player",
            width: 1,
            height: 1,
            data: new Uint8Array([255, 255, 255, 255]),
        });
        gpuResource.flushWebGl2Uploads(gl);
        gpuResource.resolveWebGl2Texture("sprite.player", gl);
        const buffer = gpuResource.createBuffer({
            label: "frame.vertices",
            size: 16,
            kind: "vertex",
        });
        gpuResource.getWebGl2Buffer(buffer, gl);

        expect(gpuResource.release(texture)).toBe(true);
        expect(gpuResource.release(buffer)).toBe(true);

        expect(gl.deleteTexture).toHaveBeenCalledTimes(1);
        expect(gl.deleteSampler).toHaveBeenCalledTimes(1);
        expect(gl.deleteBuffer).toHaveBeenCalledTimes(1);
        expect(gpuResource.resolveWebGl2Texture("sprite.player", gl)?.fallback).toBe(
            true,
        );

        await gpuResource.dispose();
    });

    it("represents uniform and storage buffer descriptors without breaking WebGL2 uploads", async () => {
        const gl = createFakeWebGl2();
        const gpuResource = createGpuResource({});
        await gpuResource.start();

        const uniform = gpuResource.createBuffer({
            label: "frame.uniforms",
            size: 16,
            kind: "uniform",
        });
        const storage = gpuResource.createBuffer({
            label: "frame.storage",
            size: 16,
            kind: "storage",
        });
        gpuResource.stageUpload({
            target: uniform,
            byteLength: 16,
            data: new Float32Array([1, 2, 3, 4]),
            usage: "dynamic-draw",
        });
        gpuResource.stageUpload({
            target: storage,
            byteLength: 16,
            data: new Float32Array([5, 6, 7, 8]),
            usage: "static-draw",
        });
        gpuResource.flushWebGl2Uploads(gl);

        expect(gl.bufferData).toHaveBeenCalledWith(
            gl.ARRAY_BUFFER,
            expect.any(Float32Array),
            gl.DYNAMIC_DRAW,
        );
        expect(gl.bufferData).toHaveBeenCalledWith(
            gl.ARRAY_BUFFER,
            expect.any(Float32Array),
            gl.STATIC_DRAW,
        );

        await gpuResource.dispose();
    });
});
