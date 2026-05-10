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

export type WebGpuDeviceLike = Readonly<{
    createShaderModule(desc: WebGpuShaderModuleDescriptor): WebGpuShaderModuleLike;
    createRenderPipeline(desc: WebGpuRenderPipelineDescriptor): WebGpuRenderPipelineLike;
}>;

export type WebGpuShaderModuleLike = object;
export type WebGpuRenderPipelineLike = Readonly<{
    getBindGroupLayout(index: number): object;
}>;

export type WebGpuShaderModuleDescriptor = Readonly<{
    label?: string;
    code: string;
}>;

export type WebGpuVertexAttribute = Readonly<{
    shaderLocation: number;
    offset: number;
    format: string;
}>;

export type WebGpuVertexBufferLayout = Readonly<{
    arrayStride: number;
    attributes: readonly WebGpuVertexAttribute[];
}>;

export type WebGpuRenderPipelineDescriptor = Readonly<{
    label?: string;
    layout: "auto";
    vertex: {
        module: WebGpuShaderModuleLike;
        entryPoint: string;
        buffers: readonly WebGpuVertexBufferLayout[];
    };
    fragment: {
        module: WebGpuShaderModuleLike;
        entryPoint: string;
        targets: readonly {
            format: string;
            blend?: {
                color: WebGpuBlendComponent;
                alpha: WebGpuBlendComponent;
            };
        }[];
    };
    primitive: {
        topology: "triangle-list";
    };
}>;

export type WebGpuBlendComponent = Readonly<{
    srcFactor: string;
    dstFactor: string;
    operation: "add";
}>;

export type WebGpuPipeline = Readonly<{
    handle: PipelineHandle;
    pipeline: WebGpuRenderPipelineLike;
}>;
