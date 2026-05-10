import type {
    PipelineDescriptor,
    WebGpuBlendComponent,
    WebGpuRenderPipelineDescriptor,
    WebGpuVertexBufferLayout,
} from "../service/PipelineLibrary.types";
import { BYTES_PER_FLOAT, RENDER_2D_VERTEX_LAYOUTS } from "../../modules/submitters/Render2DVertexPacking.module";

export type WebGpuShaderSource = Readonly<{
    vertex: string;
    fragment: string;
    vertexBuffer: WebGpuVertexBufferLayout;
}>;

const SOLID_VERTEX_SHADER = `
struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
};

@vertex
fn main(
    @location(0) position: vec2f,
    @location(1) color: vec4f,
) -> VertexOut {
    var out: VertexOut;
    out.position = vec4f(position, 0.0, 1.0);
    out.color = color;
    return out;
}`;

const SOLID_FRAGMENT_SHADER = `
@fragment
fn main(@location(0) color: vec4f) -> @location(0) vec4f {
    return color;
}`;

const TEXTURED_VERTEX_SHADER = `
struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
    @location(1) tint: vec4f,
};

@vertex
fn main(
    @location(0) position: vec2f,
    @location(1) uv: vec2f,
    @location(2) tint: vec4f,
) -> VertexOut {
    var out: VertexOut;
    out.position = vec4f(position, 0.0, 1.0);
    out.uv = uv;
    out.tint = tint;
    return out;
}`;

const TEXTURED_FRAGMENT_SHADER = `
@group(0) @binding(0) var u_texture: texture_2d<f32>;
@group(0) @binding(1) var u_sampler: sampler;

@fragment
fn main(
    @location(0) uv: vec2f,
    @location(1) tint: vec4f,
) -> @location(0) vec4f {
    return textureSample(u_texture, u_sampler, uv) * tint;
}`;

function createVertexBufferLayout(
    key: PipelineDescriptor["vertexLayoutKey"],
): WebGpuVertexBufferLayout {
    const layout = RENDER_2D_VERTEX_LAYOUTS[key];
    return {
        arrayStride: layout.strideFloats * BYTES_PER_FLOAT,
        attributes: layout.attrs.map((attr) => ({
            shaderLocation: attr.location,
            offset: attr.offsetFloats * BYTES_PER_FLOAT,
            format: attr.size === 4 ? "float32x4" : "float32x2",
        })),
    };
}

function getAlphaBlend(): {
    color: WebGpuBlendComponent;
    alpha: WebGpuBlendComponent;
} {
    return {
        color: {
            srcFactor: "src-alpha",
            dstFactor: "one-minus-src-alpha",
            operation: "add",
        },
        alpha: {
            srcFactor: "one",
            dstFactor: "one-minus-src-alpha",
            operation: "add",
        },
    };
}

export function resolveWebGpuShaderSource(
    desc: PipelineDescriptor,
): WebGpuShaderSource | undefined {
    if (
        desc.shaderFamily === "solid-2d" &&
        desc.vertexLayoutKey === "position-color-2d"
    ) {
        return {
            vertex: SOLID_VERTEX_SHADER,
            fragment: SOLID_FRAGMENT_SHADER,
            vertexBuffer: createVertexBufferLayout(desc.vertexLayoutKey),
        };
    }

    if (
        desc.shaderFamily === "textured-2d" &&
        desc.vertexLayoutKey === "position-uv-tint-2d"
    ) {
        return {
            vertex: TEXTURED_VERTEX_SHADER,
            fragment: TEXTURED_FRAGMENT_SHADER,
            vertexBuffer: createVertexBufferLayout(desc.vertexLayoutKey),
        };
    }

    return undefined;
}

export function createWebGpuRenderPipelineDescriptor(args: {
    desc: PipelineDescriptor;
    format: string;
    vertexModule: object;
    fragmentModule: object;
    shaderSource: WebGpuShaderSource;
}): WebGpuRenderPipelineDescriptor {
    return {
        label: `render.${args.desc.shaderFamily}.${args.desc.blend}`,
        layout: "auto",
        vertex: {
            module: args.vertexModule,
            entryPoint: "main",
            buffers: [args.shaderSource.vertexBuffer],
        },
        fragment: {
            module: args.fragmentModule,
            entryPoint: "main",
            targets: [
                {
                    format: args.format,
                    blend:
                        args.desc.blend === "alpha" ? getAlphaBlend() : undefined,
                },
            ],
        },
        primitive: {
            topology: "triangle-list",
        },
    };
}
