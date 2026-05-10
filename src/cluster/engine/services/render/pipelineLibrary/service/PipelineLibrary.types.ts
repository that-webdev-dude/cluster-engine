import type { GfxBackend, GfxState } from "../../gfxBackend";
import type { RenderBlendMode, RenderLayerId } from "../../service/Render.types";

export type PipelineLibraryConfig = Readonly<{
    debug?: boolean;
}>;

export type PipelineLibraryKey = string;
export type PipelineHandle = `pipeline:${number}`;
export type PipelinePrimitive = "triangles" | "lines";
export type PipelineShaderFamily = "solid-2d" | "textured-2d";
export type PipelineVertexLayoutKey =
    | "position-color-2d"
    | "position-uv-tint-2d";

export type PipelineDescriptor = Readonly<{
    shaderFamily: PipelineShaderFamily;
    passKey: RenderLayerId;
    materialKey: string;
    primitive: PipelinePrimitive;
    blend: RenderBlendMode;
    vertexLayoutKey: PipelineVertexLayoutKey;
}>;

export type PipelineLibrarySyncArgs = Readonly<{
    gfxBackend: GfxBackend;
    gfxStatus: GfxState;
}>;

export type PipelineRecordView = Readonly<{
    key: PipelineLibraryKey;
    handle: PipelineHandle;
    backend: GfxBackend;
    invalidated: boolean;
}>;

export type WebGl2Pipeline = Readonly<{
    handle: PipelineHandle;
    program: WebGLProgram;
}>;
