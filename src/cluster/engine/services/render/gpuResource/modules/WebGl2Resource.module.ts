import type {
    GpuBufferKind,
    GpuBufferUploadRequest,
    GpuSamplerAddressMode,
    GpuSamplerDesc,
    GpuTextureFormat,
} from "../service/GpuResource.types";

export type WebGl2TextureUpload = Readonly<{
    width: number;
    height: number;
    format: GpuTextureFormat;
    data: ArrayBufferView;
}>;

export function deleteWebGl2Buffer(
    gl: WebGL2RenderingContext | undefined,
    buffer: WebGLBuffer | undefined,
): void {
    if (!gl || !buffer) return;
    gl.deleteBuffer(buffer);
}

export function deleteWebGl2Texture(
    gl: WebGL2RenderingContext | undefined,
    texture: WebGLTexture | undefined,
): void {
    if (!gl || !texture) return;
    gl.deleteTexture(texture);
}

export function deleteWebGl2Sampler(
    gl: WebGL2RenderingContext | undefined,
    sampler: WebGLSampler | undefined,
): void {
    if (!gl || !sampler) return;
    gl.deleteSampler(sampler);
}

export function createWebGl2Buffer(
    gl: WebGL2RenderingContext,
): WebGLBuffer | undefined {
    return gl.createBuffer() ?? undefined;
}

export function createWebGl2Texture(
    gl: WebGL2RenderingContext,
): WebGLTexture | undefined {
    return gl.createTexture() ?? undefined;
}

function samplerFilterToWebGl(
    gl: WebGL2RenderingContext,
    filter: GpuSamplerDesc["minFilter"],
): number {
    return filter === "nearest" ? gl.NEAREST : gl.LINEAR;
}

function samplerAddressModeToWebGl(
    gl: WebGL2RenderingContext,
    mode: GpuSamplerAddressMode | undefined,
): number {
    if (mode === "repeat") return gl.REPEAT;
    if (mode === "mirror-repeat") return gl.MIRRORED_REPEAT;
    return gl.CLAMP_TO_EDGE;
}

export function createWebGl2Sampler(
    gl: WebGL2RenderingContext,
    desc: GpuSamplerDesc,
): WebGLSampler | undefined {
    const sampler = gl.createSampler();
    if (!sampler) return undefined;
    gl.samplerParameteri(
        sampler,
        gl.TEXTURE_MIN_FILTER,
        samplerFilterToWebGl(gl, desc.minFilter),
    );
    gl.samplerParameteri(
        sampler,
        gl.TEXTURE_MAG_FILTER,
        samplerFilterToWebGl(gl, desc.magFilter),
    );
    gl.samplerParameteri(
        sampler,
        gl.TEXTURE_WRAP_S,
        samplerAddressModeToWebGl(gl, desc.addressModeU),
    );
    gl.samplerParameteri(
        sampler,
        gl.TEXTURE_WRAP_T,
        samplerAddressModeToWebGl(gl, desc.addressModeV),
    );
    return sampler;
}

function textureFormatToWebGl(
    gl: WebGL2RenderingContext,
    format: GpuTextureFormat,
) {
    switch (format) {
        case "rgba8":
            return {
                internalFormat: gl.RGBA8,
                format: gl.RGBA,
                type: gl.UNSIGNED_BYTE,
            };
    }
}

export function uploadWebGl2Texture(
    gl: WebGL2RenderingContext,
    texture: WebGLTexture,
    samplerDesc: GpuSamplerDesc | undefined,
    upload: WebGl2TextureUpload,
): void {
    const format = textureFormatToWebGl(gl, upload.format);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        format.internalFormat,
        upload.width,
        upload.height,
        0,
        format.format,
        format.type,
        upload.data,
    );
    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        samplerFilterToWebGl(gl, samplerDesc?.minFilter),
    );
    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MAG_FILTER,
        samplerFilterToWebGl(gl, samplerDesc?.magFilter),
    );
    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_S,
        samplerAddressModeToWebGl(gl, samplerDesc?.addressModeU),
    );
    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_T,
        samplerAddressModeToWebGl(gl, samplerDesc?.addressModeV),
    );
    gl.bindTexture(gl.TEXTURE_2D, null);
}

export function bufferKindToWebGlTarget(
    gl: WebGL2RenderingContext,
    kind: GpuBufferKind,
): number {
    return kind === "index" ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
}

export function uploadUsageToWebGlUsage(
    gl: WebGL2RenderingContext,
    usage: GpuBufferUploadRequest["usage"],
): number {
    if (usage === "static-draw") return gl.STATIC_DRAW;
    if (usage === "dynamic-draw") return gl.DYNAMIC_DRAW;
    return gl.STREAM_DRAW;
}
