import type { PipelineDescriptor } from "../service/PipelineLibrary.types";

export type WebGl2ShaderSource = Readonly<{
    vertex: string;
    fragment: string;
}>;

const SOLID_VERTEX_SHADER = `#version 300 es
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec4 a_color;
out vec4 v_color;
void main() {
    v_color = a_color;
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const SOLID_FRAGMENT_SHADER = `#version 300 es
precision mediump float;
in vec4 v_color;
out vec4 outColor;
void main() {
    outColor = v_color;
}`;

const TEXTURED_VERTEX_SHADER = `#version 300 es
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_uv;
layout(location = 2) in vec4 a_tint;
out vec2 v_uv;
out vec4 v_tint;
void main() {
    v_uv = a_uv;
    v_tint = a_tint;
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const TEXTURED_FRAGMENT_SHADER = `#version 300 es
precision mediump float;
uniform sampler2D u_texture;
in vec2 v_uv;
in vec4 v_tint;
out vec4 outColor;
void main() {
    outColor = texture(u_texture, v_uv) * v_tint;
}`;

export function resolveWebGl2ShaderSource(
    desc: PipelineDescriptor,
): WebGl2ShaderSource | undefined {
    if (
        desc.shaderFamily === "solid-2d" &&
        desc.vertexLayoutKey === "position-color-2d"
    ) {
        return {
            vertex: SOLID_VERTEX_SHADER,
            fragment: SOLID_FRAGMENT_SHADER,
        };
    }

    if (
        desc.shaderFamily === "textured-2d" &&
        desc.vertexLayoutKey === "position-uv-tint-2d"
    ) {
        return {
            vertex: TEXTURED_VERTEX_SHADER,
            fragment: TEXTURED_FRAGMENT_SHADER,
        };
    }

    return undefined;
}
