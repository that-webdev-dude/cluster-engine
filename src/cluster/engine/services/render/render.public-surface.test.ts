import { describe, expect, expectTypeOf, it } from "vitest";
import * as renderPackage from "./index";
import { createRender } from "./index";
import type {
    RenderConfig,
    RenderFrameInput,
    RenderFrameStats,
    RenderResourceConfig,
    RenderSubmitResult,
    RenderTargetInfo,
    RenderTextureResourceConfig,
    RenderView,
} from "./index";

describe("render public surface", () => {
    it("keeps the engine render package barrel narrow", () => {
        expect(Object.keys(renderPackage)).toEqual(["createRender"]);
        expect(renderPackage.createRender).toBe(createRender);

        expectTypeOf<RenderConfig>().toHaveProperty("canvas");
        expectTypeOf<RenderFrameInput>().toMatchTypeOf<
            Readonly<{
                target: RenderTargetInfo;
                alpha: number;
            }>
        >();
        expectTypeOf<RenderFrameStats>().toHaveProperty("drawCallCount");
        expectTypeOf<RenderResourceConfig>().toHaveProperty("textures");
        expectTypeOf<RenderSubmitResult>().toMatchTypeOf<
            | { readonly status: "submitted" }
            | { readonly status: "skipped"; readonly reason: string }
            | { readonly status: "no-frame" }
        >();
        expectTypeOf<RenderTextureResourceConfig>().toHaveProperty("data");
        expectTypeOf<RenderView>().toHaveProperty("lastSubmitResult");

        expect("FrameBuilder" in renderPackage).toBe(false);
        expect("Render2DPrepare" in renderPackage).toBe(false);
        expect("SubmitFrame" in renderPackage).toBe(false);
        expect("createRenderFrameBuilder" in renderPackage).toBe(false);
        expect("createRender2DPrepare" in renderPackage).toBe(false);
        expect("createSubmitFrame" in renderPackage).toBe(false);
    });
});
