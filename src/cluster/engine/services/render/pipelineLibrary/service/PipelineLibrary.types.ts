import type { GfxBackend, GfxState } from "../../gfxBackend";
import type { RenderBlendMode, RenderLayerId } from "../../service/Render.types";

export type PipelineLibraryConfig = Readonly<{
    debug?: boolean;
}>;

export type PipelineLibraryKey = string;
export type PipelineHandle = `pipeline:${number}`;
export type PipelinePrimitive = "triangles" | "lines";

export type PipelineShaderSource = Readonly<{
    vertex: string;
    fragment: string;
}>;

export type PipelineDescriptor = Readonly<{
    key: PipelineLibraryKey;
    pass: RenderLayerId;
    shader: PipelineShaderSource;
    blend?: RenderBlendMode;
    primitive?: PipelinePrimitive;
    layoutKey?: string;
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
