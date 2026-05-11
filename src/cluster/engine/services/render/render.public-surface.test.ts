import { describe, expect, expectTypeOf, it } from "vitest";
import * as renderPackage from "./index";
import { createRender } from "./index";
import renderTypesSource from "./service/Render.types.ts?raw";
import type {
    RenderBackend,
    RenderBitmapFontConfig,
    RenderBitmapFontPageConfig,
    RenderBitmapGlyphConfig,
    RenderBlendMode,
    RenderCameraInput,
    RenderConfig,
    RenderFrameInput,
    RenderFrameStats,
    RenderFontId,
    RenderFontPageId,
    RenderGlyphKerningConfig,
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
        expectTypeOf<RenderFontId>().toEqualTypeOf<string>();
        expectTypeOf<RenderFontPageId>().toEqualTypeOf<string>();
        expectTypeOf<RenderBlendMode>().toEqualTypeOf<"opaque" | "alpha">();
        expectTypeOf<RenderItem2D>().toHaveProperty("kind");
        expectTypeOf<RenderTransform2DInput>().toHaveProperty("prevX");
        expectTypeOf<RenderFrameStats>().toHaveProperty("drawCallCount");
        expectTypeOf<RenderFrameStats>().toHaveProperty("fontResourceCount");
        expectTypeOf<RenderResourceConfig>().toHaveProperty("textures");
        expectTypeOf<RenderResourceConfig>().toHaveProperty("fonts");
        expectTypeOf<RenderSubmitResult>().toMatchTypeOf<
            | { readonly status: "submitted" }
            | { readonly status: "skipped"; readonly reason: string }
            | { readonly status: "no-frame" }
        >();
        expectTypeOf<RenderTextureResourceConfig>().toHaveProperty("data");
        expectTypeOf<RenderBitmapFontConfig>().toHaveProperty("baseSize");
        expectTypeOf<RenderBitmapFontPageConfig>().toHaveProperty("resourceId");
        expectTypeOf<RenderBitmapGlyphConfig>().toHaveProperty("xAdvance");
        expectTypeOf<RenderGlyphKerningConfig>().toHaveProperty("amount");
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
        expect(renderTypesSource).not.toMatch(
            /from\s+["'][^"']*(game|managers|scenes|world|entity|query|_legacy_\/render)/,
        );
    });
});
