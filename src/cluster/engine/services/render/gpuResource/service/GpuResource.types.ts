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
export type GpuFrameVertexLayoutKey =
    | "position-color-2d"
    | "position-uv-tint-2d";

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
        texture?: WebGpuTextureLike;
        view?: WebGpuTextureViewLike;
        bindGroup?: WebGpuBindGroupLike;
    };
};

export type GpuBufferBackendState = {
    webgl2?: {
        buffer?: WebGLBuffer;
    };
    webgpu?: {
        buffer?: WebGpuBufferLike;
        capacityBytes?: number;
    };
};

export type GpuSamplerBackendState = {
    webgl2?: {
        sampler?: WebGLSampler;
    };
    webgpu?: {
        sampler?: WebGpuSamplerLike;
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

export type WebGpuDeviceLike = Readonly<{
    createBuffer(desc: WebGpuBufferDescriptor): WebGpuBufferLike;
    createTexture(desc: WebGpuTextureDescriptor): WebGpuTextureLike;
    createSampler(desc: WebGpuSamplerDescriptor): WebGpuSamplerLike;
    createBindGroup(desc: WebGpuBindGroupDescriptor): WebGpuBindGroupLike;
    queue: WebGpuQueueLike;
}>;

export type WebGpuQueueLike = Readonly<{
    writeBuffer(
        buffer: WebGpuBufferLike,
        bufferOffset: number,
        data: ArrayBufferView,
    ): void;
    writeTexture(
        destination: WebGpuImageCopyTexture,
        data: ArrayBufferView,
        dataLayout: WebGpuImageDataLayout,
        size: WebGpuExtent3D,
    ): void;
}>;

export type WebGpuBufferLike = Readonly<{
    destroy?(): void;
}>;

export type WebGpuTextureLike = Readonly<{
    createView(): WebGpuTextureViewLike;
    destroy?(): void;
}>;

export type WebGpuTextureViewLike = object;
export type WebGpuSamplerLike = object;
export type WebGpuBindGroupLike = object;

export type WebGpuBufferDescriptor = Readonly<{
    label?: string;
    size: number;
    usage: number;
}>;

export type WebGpuTextureDescriptor = Readonly<{
    label?: string;
    size: WebGpuExtent3D;
    format: string;
    usage: number;
}>;

export type WebGpuSamplerDescriptor = Readonly<{
    label?: string;
    minFilter: "nearest" | "linear";
    magFilter: "nearest" | "linear";
    addressModeU: "clamp-to-edge" | "repeat" | "mirror-repeat";
    addressModeV: "clamp-to-edge" | "repeat" | "mirror-repeat";
}>;

export type WebGpuBindGroupDescriptor = Readonly<{
    label?: string;
    layout: object;
    entries: readonly {
        binding: number;
        resource: object;
    }[];
}>;

export type WebGpuImageCopyTexture = Readonly<{
    texture: WebGpuTextureLike;
}>;

export type WebGpuImageDataLayout = Readonly<{
    bytesPerRow: number;
    rowsPerImage: number;
}>;

export type WebGpuExtent3D = Readonly<{
    width: number;
    height: number;
    depthOrArrayLayers?: number;
}>;

export type WebGpuTextureBinding = Readonly<{
    texture: WebGpuTextureLike;
    view: WebGpuTextureViewLike;
    sampler: WebGpuSamplerLike;
    bindGroup?: WebGpuBindGroupLike;
    fallback: boolean;
}>;

export type WebGpuFrameVertexBuffer = Readonly<{
    buffer: WebGpuBufferLike;
    capacityBytes: number;
}>;

export type GpuResourceSyncArgs = Readonly<{
    gfxStatus: GpuResourceContextState;
}>;
