import type {
    PipelineDescriptor,
    WebGpuBlendComponent,
    WebGpuRenderPipelineDescriptor,
    WebGpuVertexBufferLayout,
} from "../service/PipelineLibrary.types";
import {
    BYTES_PER_FLOAT,
    RENDER_2D_VERTEX_LAYOUTS,
} from "../../../modules/Render2DVertexPacking.module";
import { RENDER_2D_INSTANCE_LAYOUTS } from "../../../modules/Render2DInstancePacking.module";

export type WebGpuShaderSource = Readonly<{
    vertex: string;
    fragment: string;
    vertexBuffers: readonly WebGpuVertexBufferLayout[];
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

const SOLID_QUAD_INSTANCE_VERTEX_SHADER = `
struct FrameUniforms {
    frame: vec4f,
    camera: vec4f,
    cameraExtra: vec4f,
};

struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
};

@group(0) @binding(0) var<uniform> u_frameUniforms: FrameUniforms;

@vertex
fn main(
    @location(0) unit: vec2f,
    @location(1) positionData: vec4f,
    @location(2) scaleData: vec4f,
    @location(3) rotationOffset: vec4f,
    @location(4) pivot: vec2f,
    @location(5) rect: vec4f,
    @location(6) color: vec4f,
    @location(7) group: vec2f,
) -> VertexOut {
    var out: VertexOut;
    let alpha = u_frameUniforms.frame.x;
    let targetSize = u_frameUniforms.frame.yz;
    let position = mix(positionData.zw, positionData.xy, vec2f(alpha));
    let scale = mix(scaleData.zw, scaleData.xy, vec2f(alpha));
    let radians = mix(rotationOffset.y, rotationOffset.x, alpha);
    let local = rect.xy + unit * rect.zw;
    let scaled = (local - pivot) * scale;
    let c = cos(radians);
    let s = sin(radians);
    let rotated = vec2f(scaled.x * c - scaled.y * s, scaled.x * s + scaled.y * c);
    let world = position + rotationOffset.zw + pivot + rotated;
    let screen = (world - u_frameUniforms.camera.xy) * u_frameUniforms.camera.z + vec2f(u_frameUniforms.camera.w, u_frameUniforms.cameraExtra.x);
    out.position = vec4f(vec2f((screen.x / targetSize.x) * 2.0 - 1.0, 1.0 - (screen.y / targetSize.y) * 2.0), 0.0, 1.0);
    out.color = color;
    return out;
}`;

const TEXTURED_QUAD_INSTANCE_VERTEX_SHADER = `
struct FrameUniforms {
    frame: vec4f,
    camera: vec4f,
    cameraExtra: vec4f,
};

struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
    @location(1) tint: vec4f,
};

@group(1) @binding(0) var<uniform> u_frameUniforms: FrameUniforms;

@vertex
fn main(
    @location(0) unit: vec2f,
    @location(1) positionData: vec4f,
    @location(2) scaleData: vec4f,
    @location(3) rotationOffset: vec4f,
    @location(4) pivot: vec2f,
    @location(5) rect: vec4f,
    @location(6) uvRect: vec4f,
    @location(7) tint: vec4f,
    @location(8) group: vec2f,
) -> VertexOut {
    var out: VertexOut;
    let alpha = u_frameUniforms.frame.x;
    let targetSize = u_frameUniforms.frame.yz;
    let position = mix(positionData.zw, positionData.xy, vec2f(alpha));
    let scale = mix(scaleData.zw, scaleData.xy, vec2f(alpha));
    let radians = mix(rotationOffset.y, rotationOffset.x, alpha);
    let local = rect.xy + unit * rect.zw;
    let scaled = (local - pivot) * scale;
    let c = cos(radians);
    let s = sin(radians);
    let rotated = vec2f(scaled.x * c - scaled.y * s, scaled.x * s + scaled.y * c);
    let world = position + rotationOffset.zw + pivot + rotated;
    let screen = (world - u_frameUniforms.camera.xy) * u_frameUniforms.camera.z + vec2f(u_frameUniforms.camera.w, u_frameUniforms.cameraExtra.x);
    out.position = vec4f(vec2f((screen.x / targetSize.x) * 2.0 - 1.0, 1.0 - (screen.y / targetSize.y) * 2.0), 0.0, 1.0);
    out.uv = uvRect.xy + unit * uvRect.zw;
    out.tint = tint;
    return out;
}`;

const SOLID_LINE_INSTANCE_VERTEX_SHADER = `
struct FrameUniforms {
    frame: vec4f,
    camera: vec4f,
    cameraExtra: vec4f,
};

struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
};

@group(0) @binding(0) var<uniform> u_frameUniforms: FrameUniforms;

fn projectPoint(world: vec2f) -> vec2f {
    let targetSize = u_frameUniforms.frame.yz;
    let screen = (world - u_frameUniforms.camera.xy) * u_frameUniforms.camera.z + vec2f(u_frameUniforms.camera.w, u_frameUniforms.cameraExtra.x);
    return vec2f((screen.x / targetSize.x) * 2.0 - 1.0, 1.0 - (screen.y / targetSize.y) * 2.0);
}

@vertex
fn main(
    @location(0) lineUnit: vec2f,
    @location(1) points: vec4f,
    @location(2) style: vec4f,
    @location(3) color: vec4f,
) -> VertexOut {
    var out: VertexOut;
    let start = points.xy;
    let end = points.zw;
    let direction = end - start;
    let lengthValue = length(direction);
    let normal = select(vec2f(0.0), vec2f(-direction.y, direction.x) / lengthValue, lengthValue > 0.0);
    let world = mix(start, end, vec2f(lineUnit.x)) + normal * lineUnit.y * style.x * 0.5;
    out.position = vec4f(projectPoint(world), 0.0, 1.0);
    out.color = color;
    return out;
}`;

const SOLID_CIRCLE_INSTANCE_VERTEX_SHADER = `
struct FrameUniforms {
    frame: vec4f,
    camera: vec4f,
    cameraExtra: vec4f,
};

struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
};

@group(0) @binding(0) var<uniform> u_frameUniforms: FrameUniforms;

fn projectLocal(local: vec2f, positionData: vec4f, scaleData: vec4f, rotationOffset: vec4f, pivot: vec2f) -> vec2f {
    let alpha = u_frameUniforms.frame.x;
    let targetSize = u_frameUniforms.frame.yz;
    let position = mix(positionData.zw, positionData.xy, vec2f(alpha));
    let scale = mix(scaleData.zw, scaleData.xy, vec2f(alpha));
    let radians = mix(rotationOffset.y, rotationOffset.x, alpha);
    let scaled = (local - pivot) * scale;
    let c = cos(radians);
    let s = sin(radians);
    let rotated = vec2f(scaled.x * c - scaled.y * s, scaled.x * s + scaled.y * c);
    let world = position + rotationOffset.zw + pivot + rotated;
    let screen = (world - u_frameUniforms.camera.xy) * u_frameUniforms.camera.z + vec2f(u_frameUniforms.camera.w, u_frameUniforms.cameraExtra.x);
    return vec2f((screen.x / targetSize.x) * 2.0 - 1.0, 1.0 - (screen.y / targetSize.y) * 2.0);
}

@vertex
fn main(
    @location(0) unit: vec2f,
    @location(1) positionData: vec4f,
    @location(2) scaleData: vec4f,
    @location(3) rotationOffset: vec4f,
    @location(4) pivot: vec2f,
    @location(5) radius: vec2f,
    @location(6) color: vec4f,
    @location(7) group: vec2f,
) -> VertexOut {
    var out: VertexOut;
    out.position = vec4f(projectLocal(unit * radius, positionData, scaleData, rotationOffset, pivot), 0.0, 1.0);
    out.color = color;
    return out;
}`;

const SOLID_POLYGON_INSTANCE_VERTEX_SHADER = `
struct FrameUniforms {
    frame: vec4f,
    camera: vec4f,
    cameraExtra: vec4f,
};

struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
};

@group(0) @binding(0) var<uniform> u_frameUniforms: FrameUniforms;

fn projectLocal(local: vec2f, positionData: vec4f, scaleData: vec4f, rotationOffset: vec4f, pivot: vec2f) -> vec2f {
    let alpha = u_frameUniforms.frame.x;
    let targetSize = u_frameUniforms.frame.yz;
    let position = mix(positionData.zw, positionData.xy, vec2f(alpha));
    let scale = mix(scaleData.zw, scaleData.xy, vec2f(alpha));
    let radians = mix(rotationOffset.y, rotationOffset.x, alpha);
    let scaled = (local - pivot) * scale;
    let c = cos(radians);
    let s = sin(radians);
    let rotated = vec2f(scaled.x * c - scaled.y * s, scaled.x * s + scaled.y * c);
    let world = position + rotationOffset.zw + pivot + rotated;
    let screen = (world - u_frameUniforms.camera.xy) * u_frameUniforms.camera.z + vec2f(u_frameUniforms.camera.w, u_frameUniforms.cameraExtra.x);
    return vec2f((screen.x / targetSize.x) * 2.0 - 1.0, 1.0 - (screen.y / targetSize.y) * 2.0);
}

@vertex
fn main(
    @location(0) local: vec2f,
    @location(1) positionData: vec4f,
    @location(2) scaleData: vec4f,
    @location(3) rotationOffset: vec4f,
    @location(4) pivot: vec2f,
    @location(5) color: vec4f,
    @location(6) group: vec2f,
) -> VertexOut {
    var out: VertexOut;
    out.position = vec4f(projectLocal(local, positionData, scaleData, rotationOffset, pivot), 0.0, 1.0);
    out.color = color;
    return out;
}`;

function createVertexBufferLayout(
    key: PipelineDescriptor["vertexLayoutKey"],
): WebGpuVertexBufferLayout {
    if (key in RENDER_2D_INSTANCE_LAYOUTS) {
        const layout =
            RENDER_2D_INSTANCE_LAYOUTS[
                key as keyof typeof RENDER_2D_INSTANCE_LAYOUTS
            ];
        return {
            arrayStride: layout.strideFloats * BYTES_PER_FLOAT,
            stepMode: "instance",
            attributes: layout.attrs.map((attr) => ({
                shaderLocation: attr.location,
                offset: attr.offsetFloats * BYTES_PER_FLOAT,
                format: attr.size === 4 ? "float32x4" : "float32x2",
            })),
        };
    }

    const layout =
        RENDER_2D_VERTEX_LAYOUTS[
            key as keyof typeof RENDER_2D_VERTEX_LAYOUTS
        ];
    return {
        arrayStride: layout.strideFloats * BYTES_PER_FLOAT,
        attributes: layout.attrs.map((attr) => ({
            shaderLocation: attr.location,
            offset: attr.offsetFloats * BYTES_PER_FLOAT,
            format: attr.size === 4 ? "float32x4" : "float32x2",
        })),
    };
}

function createUnitQuadVertexBufferLayout(): WebGpuVertexBufferLayout {
    return {
        arrayStride: 2 * BYTES_PER_FLOAT,
        stepMode: "vertex",
        attributes: [
            {
                shaderLocation: 0,
                offset: 0,
                format: "float32x2",
            },
        ],
    };
}

function createStaticVec2VertexBufferLayout(): WebGpuVertexBufferLayout {
    return {
        arrayStride: 2 * BYTES_PER_FLOAT,
        stepMode: "vertex",
        attributes: [
            {
                shaderLocation: 0,
                offset: 0,
                format: "float32x2",
            },
        ],
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
            vertexBuffers: [createVertexBufferLayout(desc.vertexLayoutKey)],
        };
    }

    if (
        desc.shaderFamily === "textured-2d" &&
        desc.vertexLayoutKey === "position-uv-tint-2d"
    ) {
        return {
            vertex: TEXTURED_VERTEX_SHADER,
            fragment: TEXTURED_FRAGMENT_SHADER,
            vertexBuffers: [createVertexBufferLayout(desc.vertexLayoutKey)],
        };
    }

    if (
        desc.shaderFamily === "solid-2d" &&
        desc.vertexLayoutKey === "quad-solid-instance-2d"
    ) {
        return {
            vertex: SOLID_QUAD_INSTANCE_VERTEX_SHADER,
            fragment: SOLID_FRAGMENT_SHADER,
            vertexBuffers: [
                createUnitQuadVertexBufferLayout(),
                createVertexBufferLayout(desc.vertexLayoutKey),
            ],
        };
    }

    if (
        desc.shaderFamily === "textured-2d" &&
        desc.vertexLayoutKey === "quad-textured-instance-2d"
    ) {
        return {
            vertex: TEXTURED_QUAD_INSTANCE_VERTEX_SHADER,
            fragment: TEXTURED_FRAGMENT_SHADER,
            vertexBuffers: [
                createUnitQuadVertexBufferLayout(),
                createVertexBufferLayout(desc.vertexLayoutKey),
            ],
        };
    }

    if (
        desc.shaderFamily === "solid-2d" &&
        (desc.vertexLayoutKey === "line-solid-instance-2d" ||
            desc.vertexLayoutKey === "circle-solid-instance-2d" ||
            desc.vertexLayoutKey === "polygon-solid-instance-2d")
    ) {
        const vertex =
            desc.vertexLayoutKey === "line-solid-instance-2d"
                ? SOLID_LINE_INSTANCE_VERTEX_SHADER
                : desc.vertexLayoutKey === "circle-solid-instance-2d"
                  ? SOLID_CIRCLE_INSTANCE_VERTEX_SHADER
                  : SOLID_POLYGON_INSTANCE_VERTEX_SHADER;
        return {
            vertex,
            fragment: SOLID_FRAGMENT_SHADER,
            vertexBuffers: [
                createStaticVec2VertexBufferLayout(),
                createVertexBufferLayout(desc.vertexLayoutKey),
            ],
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
            buffers: args.shaderSource.vertexBuffers,
        },
        fragment: {
            module: args.fragmentModule,
            entryPoint: "main",
            targets: [
                {
                    format: args.format,
                    blend:
                        args.desc.blend === "alpha"
                            ? getAlphaBlend()
                            : undefined,
                },
            ],
        },
        primitive: {
            topology: "triangle-list",
        },
    };
}
