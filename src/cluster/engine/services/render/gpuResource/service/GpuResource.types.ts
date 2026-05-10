export type GpuResourceConfig = Readonly<{
    debug?: boolean;
}>;

export type GpuResourceContextState = "ok" | "lost";

export type GpuTextureHandle = `gpu-texture:${number}`;
export type GpuBufferHandle = `gpu-buffer:${number}`;
export type GpuSamplerHandle = `gpu-sampler:${number}`;

export type GpuResourceHandle =
    | GpuTextureHandle
    | GpuBufferHandle
    | GpuSamplerHandle;

export type GpuTextureFormat = "rgba8";
export type GpuBufferKind = "vertex" | "index" | "uniform" | "storage";
export type GpuSamplerFilter = "nearest" | "linear";
export type GpuBufferUploadUsage = "static-draw" | "dynamic-draw" | "stream-draw";

export type GpuTextureDesc = Readonly<{
    label?: string;
    width: number;
    height: number;
    format?: GpuTextureFormat;
}>;

export type GpuBufferDesc = Readonly<{
    label?: string;
    size: number;
    kind: GpuBufferKind;
}>;

export type GpuSamplerDesc = Readonly<{
    label?: string;
    minFilter?: GpuSamplerFilter;
    magFilter?: GpuSamplerFilter;
}>;

export type GpuTextureResourceConfig = Readonly<{
    id: string;
    label?: string;
    width: number;
    height: number;
    data: ArrayBufferView;
    format?: GpuTextureFormat;
    minFilter?: GpuSamplerFilter;
    magFilter?: GpuSamplerFilter;
}>;

export type GpuBufferUploadRequest = Readonly<{
    kind?: "buffer";
    target: GpuBufferHandle;
    byteLength: number;
    data: ArrayBufferView;
    usage?: GpuBufferUploadUsage;
}>;

export type GpuTextureUploadRequest = Readonly<{
    kind: "texture";
    target: GpuTextureHandle;
    width?: number;
    height?: number;
    format?: GpuTextureFormat;
    data: ArrayBufferView;
    retain?: boolean;
}>;

export type GpuUploadRequest =
    | GpuBufferUploadRequest
    | GpuTextureUploadRequest;

export type WebGl2TextureBinding = Readonly<{
    texture: WebGLTexture;
    sampler?: WebGLSampler;
    fallback: boolean;
}>;

export type GpuResourceSyncArgs = Readonly<{
    gfxStatus: GpuResourceContextState;
}>;
