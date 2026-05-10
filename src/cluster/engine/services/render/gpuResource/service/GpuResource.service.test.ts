import { describe, expect, it } from "vitest";
import { createFakeWebGl2 } from "../../testing/FakeWebGl2.test-utils";
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
});
