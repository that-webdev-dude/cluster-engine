import { describe, expect, expectTypeOf, it } from "vitest";
import { readFileSync } from "node:fs";
import * as renderPackage from "./index";
import { createRender } from "./index";
import type {
    RenderBackend,
    RenderBlendMode,
    RenderCameraInput,
    RenderConfig,
    RenderFrameInput,
    RenderFrameStats,
    RenderItem2D,
    RenderLayerId,
    RenderLayerInput,
    RenderResourceId,
    RenderResourceConfig,
    RenderSubmitResult,
    RenderTargetInfo,
    RenderTextureResourceConfig,
    RenderTransform2DInput,
    RenderView,
} from "./index";

describe("render public surface", () => {
    it("keeps the engine render package barrel narrow", () => {
        expect(Object.keys(renderPackage)).toEqual(["createRender"]);
        expect(renderPackage.createRender).toBe(createRender);

        expectTypeOf<RenderBackend>().toEqualTypeOf<"none" | "webgl2" | "webgpu">();
        expectTypeOf<RenderConfig>().toHaveProperty("canvas");
        expectTypeOf<RenderConfig>().not.toHaveProperty("backend");
        expectTypeOf<RenderConfig>().not.toHaveProperty("preferredBackend");
        expectTypeOf<RenderFrameInput>().toMatchTypeOf<
            Readonly<{
                target: RenderTargetInfo;
                alpha: number;
                camera?: RenderCameraInput;
                layers: readonly RenderLayerInput[];
            }>
        >();
        expectTypeOf<RenderLayerId>().toEqualTypeOf<string>();
        expectTypeOf<RenderResourceId>().toEqualTypeOf<string>();
        expectTypeOf<RenderBlendMode>().toEqualTypeOf<"opaque" | "alpha">();
        expectTypeOf<RenderItem2D>().toHaveProperty("kind");
        expectTypeOf<RenderTransform2DInput>().toHaveProperty("prevX");
        expectTypeOf<RenderFrameStats>().toHaveProperty("drawCallCount");
        expectTypeOf<RenderResourceConfig>().toHaveProperty("textures");
        expectTypeOf<RenderSubmitResult>().toMatchTypeOf<
            | { readonly status: "submitted" }
            | { readonly status: "skipped"; readonly reason: string }
            | { readonly status: "no-frame" }
        >();
        expectTypeOf<RenderTextureResourceConfig>().toHaveProperty("data");
        expectTypeOf<RenderView>().toHaveProperty("lastSubmitResult");
        expectTypeOf<RenderView>().not.toHaveProperty("caps");
        expectTypeOf<RenderView>().not.toHaveProperty("gfxCaps");
        expectTypeOf<RenderView>().not.toHaveProperty("handle");
        expectTypeOf<RenderView>().not.toHaveProperty("adapter");
        expectTypeOf<RenderView>().not.toHaveProperty("device");
        expectTypeOf<RenderView>().not.toHaveProperty("context");

        expect("FrameBuilder" in renderPackage).toBe(false);
        expect("Render2DPrepare" in renderPackage).toBe(false);
        expect("SubmitFrame" in renderPackage).toBe(false);
        expect("createRenderFrameBuilder" in renderPackage).toBe(false);
        expect("createRender2DPrepare" in renderPackage).toBe(false);
        expect("createSubmitFrame" in renderPackage).toBe(false);
        expect("resolveRenderTransform2D" in renderPackage).toBe(false);
    });

    it("keeps public render types decoupled from engine state packages", () => {
        const source = readFileSync(
            "src/cluster/engine/services/render/service/Render.types.ts",
            "utf8",
        );

        expect(source).not.toMatch(
            /from\s+["'][^"']*(game|managers|scenes|world|entity|query|_legacy_\/render)/,
        );
    });
});
