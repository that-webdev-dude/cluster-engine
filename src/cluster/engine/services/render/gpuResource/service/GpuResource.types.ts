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
export type GpuSamplerAddressMode = "clamp-to-edge" | "repeat" | "mirror-repeat";
export type GpuBufferUploadUsage = "static-draw" | "dynamic-draw" | "stream-draw";
export type GpuTextureUsage = "sampled" | "copy-dst" | "render-target";

export type GpuTextureDesc = Readonly<{
    label?: string;
    width: number;
    height: number;
    format?: GpuTextureFormat;
    usage?: readonly GpuTextureUsage[];
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
    addressModeU?: GpuSamplerAddressMode;
    addressModeV?: GpuSamplerAddressMode;
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

export type GpuTextureBackendState = {
    webgl2?: {
        texture?: WebGLTexture;
    };
    webgpu?: {
        texture?: unknown;
        view?: unknown;
    };
};

export type GpuBufferBackendState = {
    webgl2?: {
        buffer?: WebGLBuffer;
    };
    webgpu?: {
        buffer?: unknown;
    };
};

export type GpuSamplerBackendState = {
    webgl2?: {
        sampler?: WebGLSampler;
    };
    webgpu?: {
        sampler?: unknown;
    };
};

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
