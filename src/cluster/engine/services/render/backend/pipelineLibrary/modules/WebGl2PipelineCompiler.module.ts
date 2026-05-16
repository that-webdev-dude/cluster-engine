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

const SOLID_QUAD_INSTANCE_VERTEX_SHADER = `#version 300 es
layout(location = 0) in vec2 a_unit;
layout(location = 1) in vec4 i_position;
layout(location = 2) in vec4 i_scale;
layout(location = 3) in vec4 i_rotationOffset;
layout(location = 4) in vec2 i_pivot;
layout(location = 5) in vec4 i_rect;
layout(location = 6) in vec4 i_color;
layout(location = 7) in vec2 i_group;
uniform vec4 u_frame;
uniform vec4 u_camera;
uniform vec4 u_cameraExtra;
out vec4 v_color;
vec2 projectQuadCorner() {
    float alpha = u_frame.x;
    vec2 target = u_frame.yz;
    vec2 position = mix(i_position.zw, i_position.xy, alpha);
    vec2 scale = mix(i_scale.zw, i_scale.xy, alpha);
    float radians = mix(i_rotationOffset.y, i_rotationOffset.x, alpha);
    vec2 local = i_rect.xy + a_unit * i_rect.zw;
    vec2 scaled = (local - i_pivot) * scale;
    float c = cos(radians);
    float s = sin(radians);
    vec2 rotated = vec2(scaled.x * c - scaled.y * s, scaled.x * s + scaled.y * c);
    vec2 world = position + i_rotationOffset.zw + i_pivot + rotated;
    vec2 screen = (world - u_camera.xy) * u_camera.z + vec2(u_camera.w, u_cameraExtra.x);
    return vec2((screen.x / target.x) * 2.0 - 1.0, 1.0 - (screen.y / target.y) * 2.0);
}
void main() {
    v_color = i_color;
    gl_Position = vec4(projectQuadCorner(), 0.0, 1.0);
}`;

const TEXTURED_QUAD_INSTANCE_VERTEX_SHADER = `#version 300 es
layout(location = 0) in vec2 a_unit;
layout(location = 1) in vec4 i_position;
layout(location = 2) in vec4 i_scale;
layout(location = 3) in vec4 i_rotationOffset;
layout(location = 4) in vec2 i_pivot;
layout(location = 5) in vec4 i_rect;
layout(location = 6) in vec4 i_uvRect;
layout(location = 7) in vec4 i_tint;
layout(location = 8) in vec2 i_group;
uniform vec4 u_frame;
uniform vec4 u_camera;
uniform vec4 u_cameraExtra;
out vec2 v_uv;
out vec4 v_tint;
vec2 projectQuadCorner() {
    float alpha = u_frame.x;
    vec2 target = u_frame.yz;
    vec2 position = mix(i_position.zw, i_position.xy, alpha);
    vec2 scale = mix(i_scale.zw, i_scale.xy, alpha);
    float radians = mix(i_rotationOffset.y, i_rotationOffset.x, alpha);
    vec2 local = i_rect.xy + a_unit * i_rect.zw;
    vec2 scaled = (local - i_pivot) * scale;
    float c = cos(radians);
    float s = sin(radians);
    vec2 rotated = vec2(scaled.x * c - scaled.y * s, scaled.x * s + scaled.y * c);
    vec2 world = position + i_rotationOffset.zw + i_pivot + rotated;
    vec2 screen = (world - u_camera.xy) * u_camera.z + vec2(u_camera.w, u_cameraExtra.x);
    return vec2((screen.x / target.x) * 2.0 - 1.0, 1.0 - (screen.y / target.y) * 2.0);
}
void main() {
    v_uv = i_uvRect.xy + a_unit * i_uvRect.zw;
    v_tint = i_tint;
    gl_Position = vec4(projectQuadCorner(), 0.0, 1.0);
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

    if (
        desc.shaderFamily === "solid-2d" &&
        desc.vertexLayoutKey === "quad-solid-instance-2d"
    ) {
        return {
            vertex: SOLID_QUAD_INSTANCE_VERTEX_SHADER,
            fragment: SOLID_FRAGMENT_SHADER,
        };
    }

    if (
        desc.shaderFamily === "textured-2d" &&
        desc.vertexLayoutKey === "quad-textured-instance-2d"
    ) {
        return {
            vertex: TEXTURED_QUAD_INSTANCE_VERTEX_SHADER,
            fragment: TEXTURED_FRAGMENT_SHADER,
        };
    }

    return undefined;
}
