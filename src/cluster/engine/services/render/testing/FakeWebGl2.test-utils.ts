import { vi } from "vitest";

export type MockFn = ReturnType<typeof vi.fn<any[], any>>;

export type FakeWebGl2 = WebGL2RenderingContext & {
    activeTexture: MockFn;
    attachShader: MockFn;
    bindBuffer: MockFn;
    bindSampler: MockFn;
    bindTexture: MockFn;
    blendFunc: MockFn;
    bufferData: MockFn;
    clear: MockFn;
    clearColor: MockFn;
    compileShader: MockFn;
    createBuffer: MockFn;
    createProgram: MockFn;
    createSampler: MockFn;
    createShader: MockFn;
    createTexture: MockFn;
    deleteBuffer: MockFn;
    deleteProgram: MockFn;
    deleteSampler: MockFn;
    deleteShader: MockFn;
    deleteTexture: MockFn;
    detachShader: MockFn;
    disable: MockFn;
    disableVertexAttribArray: MockFn;
    drawArrays: MockFn;
    enable: MockFn;
    enableVertexAttribArray: MockFn;
    getParameter: MockFn;
    getProgramInfoLog: MockFn;
    getProgramParameter: MockFn;
    getShaderInfoLog: MockFn;
    getShaderParameter: MockFn;
    getUniformLocation: MockFn;
    linkProgram: MockFn;
    pixelStorei: MockFn;
    samplerParameteri: MockFn;
    shaderSource: MockFn;
    texImage2D: MockFn;
    texParameteri: MockFn;
    uniform1i: MockFn;
    useProgram: MockFn;
    vertexAttribPointer: MockFn;
    viewport: MockFn;
};

export type FakeCanvas = HTMLCanvasElement & {
    getContext: MockFn;
    dispatchContextLost(): void;
};

export type FakeWebGpuDevice = {
    limits: {
        maxTextureDimension2D: number;
        maxUniformBufferBindingSize: number;
        maxBufferSize: number;
    };
    lost: Promise<unknown>;
    lose(): Promise<void>;
};

export type FakeWebGpuAdapter = {
    limits: FakeWebGpuDevice["limits"];
    requestDevice: MockFn;
};

export type FakeWebGpuCanvasContext = {
    configure: MockFn;
    unconfigure: MockFn;
};

export type FakeWebGpu = {
    requestAdapter: MockFn;
    getPreferredCanvasFormat: MockFn;
    adapter: FakeWebGpuAdapter;
    device: FakeWebGpuDevice;
    context: FakeWebGpuCanvasContext;
};

export function createFakeWebGl2(): FakeWebGl2 {
    return {
        ARRAY_BUFFER: 34962,
        BLEND: 3042,
        COLOR_BUFFER_BIT: 16384,
        CLAMP_TO_EDGE: 33071,
        COMPILE_STATUS: 35713,
        DYNAMIC_DRAW: 35048,
        ELEMENT_ARRAY_BUFFER: 34963,
        FLOAT: 5126,
        FRAGMENT_SHADER: 35632,
        LINEAR: 9729,
        LINK_STATUS: 35714,
        MAX_TEXTURE_SIZE: 3379,
        MAX_UNIFORM_BLOCK_SIZE: 35376,
        MIRRORED_REPEAT: 33648,
        NEAREST: 9728,
        ONE_MINUS_SRC_ALPHA: 771,
        REPEAT: 10497,
        RGBA: 6408,
        RGBA8: 32856,
        SRC_ALPHA: 770,
        STATIC_DRAW: 35044,
        STREAM_DRAW: 35040,
        TEXTURE0: 33984,
        TEXTURE_2D: 3553,
        TEXTURE_MAG_FILTER: 10240,
        TEXTURE_MIN_FILTER: 10241,
        TEXTURE_WRAP_S: 10242,
        TEXTURE_WRAP_T: 10243,
        TRIANGLES: 4,
        UNPACK_ALIGNMENT: 3317,
        UNSIGNED_BYTE: 5121,
        VERTEX_SHADER: 35633,
        activeTexture: vi.fn(),
        attachShader: vi.fn(),
        bindBuffer: vi.fn(),
        bindSampler: vi.fn(),
        bindTexture: vi.fn(),
        blendFunc: vi.fn(),
        bufferData: vi.fn(),
        clear: vi.fn(),
        clearColor: vi.fn(),
        compileShader: vi.fn(),
        createBuffer: vi.fn(() => ({ kind: "buffer" })),
        createProgram: vi.fn(() => ({ kind: "program" })),
        createSampler: vi.fn(() => ({ kind: "sampler" })),
        createShader: vi.fn((type: number) => ({ kind: "shader", type })),
        createTexture: vi.fn(() => ({ kind: "texture" })),
        deleteBuffer: vi.fn(),
        deleteProgram: vi.fn(),
        deleteSampler: vi.fn(),
        deleteShader: vi.fn(),
        deleteTexture: vi.fn(),
        detachShader: vi.fn(),
        disable: vi.fn(),
        disableVertexAttribArray: vi.fn(),
        drawArrays: vi.fn(),
        enable: vi.fn(),
        enableVertexAttribArray: vi.fn(),
        getParameter: vi.fn(() => 4096),
        getProgramInfoLog: vi.fn(() => "link failed"),
        getProgramParameter: vi.fn(() => true),
        getShaderInfoLog: vi.fn(() => "compile failed"),
        getShaderParameter: vi.fn(() => true),
        getUniformLocation: vi.fn(() => ({ kind: "uniform" })),
        linkProgram: vi.fn(),
        pixelStorei: vi.fn(),
        samplerParameteri: vi.fn(),
        shaderSource: vi.fn(),
        texImage2D: vi.fn(),
        texParameteri: vi.fn(),
        uniform1i: vi.fn(),
        useProgram: vi.fn(),
        vertexAttribPointer: vi.fn(),
        viewport: vi.fn(),
    } as unknown as FakeWebGl2;
}

export function createFakeCanvas(gl: WebGL2RenderingContext | null): FakeCanvas {
    const listeners = new Map<string, EventListener[]>();
    const canvas = {
        width: 0,
        height: 0,
        getContext: vi.fn((kind: string) => (kind === "webgl2" ? gl : null)),
        addEventListener: vi.fn((type: string, listener: EventListener) => {
            listeners.set(type, [...(listeners.get(type) ?? []), listener]);
        }),
        removeEventListener: vi.fn((type: string, listener: EventListener) => {
            listeners.set(
                type,
                (listeners.get(type) ?? []).filter((item) => item !== listener),
            );
        }),
        dispatchContextLost() {
            const event = { preventDefault: vi.fn() } as unknown as Event;
            for (const listener of listeners.get("webglcontextlost") ?? []) {
                listener(event);
            }
        },
    };

    return canvas as unknown as FakeCanvas;
}

export function createFakeWebGpu(): FakeWebGpu {
    let resolveLost: (value: unknown) => void = () => undefined;
    const lost = new Promise<unknown>((resolve) => {
        resolveLost = resolve;
    });
    const limits = {
        maxTextureDimension2D: 8192,
        maxUniformBufferBindingSize: 65536,
        maxBufferSize: 1048576,
    };
    const device: FakeWebGpuDevice = {
        limits,
        lost,
        async lose() {
            resolveLost({ reason: "destroyed" });
            await Promise.resolve();
        },
    };
    const adapter: FakeWebGpuAdapter = {
        limits,
        requestDevice: vi.fn(async () => device),
    };
    const context: FakeWebGpuCanvasContext = {
        configure: vi.fn(),
        unconfigure: vi.fn(),
    };

    return {
        requestAdapter: vi.fn(async () => adapter),
        getPreferredCanvasFormat: vi.fn(() => "bgra8unorm"),
        adapter,
        device,
        context,
    };
}

export function createFakeWebGpuCanvas(
    webGpu: FakeWebGpu | null,
    gl: WebGL2RenderingContext | null = null,
): FakeCanvas {
    const canvas = createFakeCanvas(gl);
    canvas.getContext.mockImplementation((kind: string) => {
        if (kind === "webgpu") return webGpu?.context ?? null;
        if (kind === "webgl2") return gl;
        return null;
    });
    return canvas;
}
