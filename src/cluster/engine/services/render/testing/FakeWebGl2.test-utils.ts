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
    bufferSubData: MockFn;
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
    drawArraysInstanced: MockFn;
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
    uniform4f: MockFn;
    useProgram: MockFn;
    vertexAttribDivisor: MockFn;
    vertexAttribPointer: MockFn;
    viewport: MockFn;
};

export type FakeCanvas = HTMLCanvasElement & {
    getContext: MockFn;
    dispatchContextLost(): void;
    dispatchContextRestored(): void;
};

export type FakeWebGpuDevice = {
    limits: {
        maxTextureDimension2D: number;
        maxUniformBufferBindingSize: number;
        maxBufferSize: number;
    };
    queue: {
        submit: MockFn;
        writeBuffer: MockFn;
        writeTexture: MockFn;
    };
    lost: Promise<unknown>;
    lose(): Promise<void>;
    createBindGroup: MockFn;
    createBuffer: MockFn;
    createCommandEncoder: MockFn;
    createRenderPipeline: MockFn;
    createSampler: MockFn;
    createShaderModule: MockFn;
    createTexture: MockFn;
};

export type FakeWebGpuAdapter = {
    limits: FakeWebGpuDevice["limits"];
    requestDevice: MockFn;
};

export type FakeWebGpuCanvasContext = {
    configure: MockFn;
    getCurrentTexture: MockFn;
    unconfigure: MockFn;
};

export type FakeWebGpuCommandEncoder = {
    beginRenderPass: MockFn;
    finish: MockFn;
};

export type FakeWebGpuRenderPass = {
    draw: MockFn;
    end: MockFn;
    setBindGroup: MockFn;
    setPipeline: MockFn;
    setVertexBuffer: MockFn;
};

export type FakeWebGpu = {
    requestAdapter: MockFn;
    getPreferredCanvasFormat: MockFn;
    adapter: FakeWebGpuAdapter;
    commandEncoder: FakeWebGpuCommandEncoder;
    device: FakeWebGpuDevice;
    context: FakeWebGpuCanvasContext;
    renderPass: FakeWebGpuRenderPass;
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
        bufferSubData: vi.fn(),
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
        drawArraysInstanced: vi.fn(),
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
        uniform4f: vi.fn(),
        useProgram: vi.fn(),
        vertexAttribDivisor: vi.fn(),
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
        dispatchContextRestored() {
            const event = {} as Event;
            for (const listener of listeners.get("webglcontextrestored") ?? []) {
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
    const renderPass: FakeWebGpuRenderPass = {
        draw: vi.fn(),
        end: vi.fn(),
        setBindGroup: vi.fn(),
        setPipeline: vi.fn(),
        setVertexBuffer: vi.fn(),
    };
    const commandEncoder: FakeWebGpuCommandEncoder = {
        beginRenderPass: vi.fn(() => renderPass),
        finish: vi.fn(() => ({ kind: "command-buffer" })),
    };
    const device: FakeWebGpuDevice = {
        limits,
        queue: {
            submit: vi.fn(),
            writeBuffer: vi.fn(),
            writeTexture: vi.fn(),
        },
        lost,
        async lose() {
            resolveLost({ reason: "destroyed" });
            await Promise.resolve();
        },
        createBindGroup: vi.fn(() => ({ kind: "bind-group" })),
        createBuffer: vi.fn(() => ({ kind: "webgpu-buffer", destroy: vi.fn() })),
        createCommandEncoder: vi.fn(() => commandEncoder),
        createRenderPipeline: vi.fn(() => ({
            kind: "render-pipeline",
            getBindGroupLayout: vi.fn((index: number) => ({
                kind: "bind-group-layout",
                index,
            })),
        })),
        createSampler: vi.fn(() => ({ kind: "webgpu-sampler" })),
        createShaderModule: vi.fn(() => ({ kind: "shader-module" })),
        createTexture: vi.fn(() => ({
            kind: "webgpu-texture",
            createView: vi.fn(() => ({ kind: "webgpu-texture-view" })),
            destroy: vi.fn(),
        })),
    };
    const adapter: FakeWebGpuAdapter = {
        limits,
        requestDevice: vi.fn(async () => device),
    };
    const context: FakeWebGpuCanvasContext = {
        configure: vi.fn(),
        getCurrentTexture: vi.fn(() => ({
            kind: "current-texture",
            createView: vi.fn(() => ({ kind: "current-texture-view" })),
        })),
        unconfigure: vi.fn(),
    };

    return {
        requestAdapter: vi.fn(async () => adapter),
        getPreferredCanvasFormat: vi.fn(() => "bgra8unorm"),
        adapter,
        commandEncoder,
        device,
        context,
        renderPass,
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
