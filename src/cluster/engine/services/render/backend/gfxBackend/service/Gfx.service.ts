import { createLifecycle } from "../../../../../controllers/Lifecycle.controller";
import type { RenderTargetInfo } from "../../../service/Render.types";
import { createGfxView } from "./Gfx.view";
import type {
    GfxBackend,
    GfxCaps,
    GfxConfig,
    GfxSnapshot,
    GfxView,
} from "./Gfx.types";

export type GfxWebGl2Runtime = Readonly<{
    backend: "webgl2";
    caps: GfxCaps;
    handle: WebGL2RenderingContext;
}>;

export type GfxWebGpuRuntime = Readonly<{
    backend: "webgpu";
    caps: GfxCaps;
    adapter: WebGpuAdapterLike;
    device: WebGpuDeviceLike;
    context: WebGpuCanvasContextLike;
    format: string;
}>;

export type GfxRuntime = GfxWebGl2Runtime | GfxWebGpuRuntime;

export type GfxService = Readonly<{
    view: GfxView;
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    latch(): void;
    recoverIfLost(): boolean;
    configureSurface(target: RenderTargetInfo): void;
    getRuntime(): GfxRuntime | undefined;
    dispose(): Promise<boolean>;
}>;

type HtmlCanvasLike = HTMLCanvasElement & {
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
};

type CanvasSizeLike = {
    width: number;
    height: number;
};

type CanvasContextLike = {
    getContext(contextId: string): unknown;
};

type WebGpuRootLike = Readonly<{
    requestAdapter(): Promise<WebGpuAdapterLike | null>;
    getPreferredCanvasFormat(): string;
}>;

type WebGpuAdapterLike = Readonly<{
    limits?: WebGpuLimitsLike;
    requestDevice(): Promise<WebGpuDeviceLike>;
}>;

type WebGpuDeviceLike = Readonly<{
    limits?: WebGpuLimitsLike;
    lost: Promise<unknown>;
    queue: {
        submit(commandBuffers: readonly object[]): void;
        writeBuffer(
            buffer: object,
            bufferOffset: number,
            data: ArrayBufferView,
        ): void;
        writeTexture(
            destination: object,
            data: ArrayBufferView,
            dataLayout: object,
            size: object,
        ): void;
    };
    createBuffer(desc: object): object;
    createTexture(desc: object): { createView(): object; destroy?(): void };
    createSampler(desc: object): object;
    createShaderModule(desc: object): object;
    createRenderPipeline(desc: object): {
        getBindGroupLayout(index: number): object;
    };
    createBindGroup(desc: object): object;
    createCommandEncoder(desc?: object): WebGpuCommandEncoderLike;
}>;

type WebGpuCanvasContextLike = Readonly<{
    configure(config: WebGpuCanvasConfigurationLike): void;
    unconfigure?(): void;
    getCurrentTexture(): { createView(): object };
}>;

type WebGpuCommandEncoderLike = Readonly<{
    beginRenderPass(desc: object): object;
    finish(): object;
}>;

type WebGpuCanvasConfigurationLike = Readonly<{
    device: WebGpuDeviceLike;
    format: string;
    alphaMode: "premultiplied";
}>;

type WebGpuLimitsLike = Readonly<{
    maxTextureDimension2D?: unknown;
    maxUniformBufferBindingSize?: unknown;
    maxBufferSize?: unknown;
}>;

type ConfiguredWebGpuSurface = Readonly<{
    device: WebGpuDeviceLike;
    format: string;
    width: number;
    height: number;
    dpr: number;
}>;

function readFiniteCapability(value: unknown): number | undefined {
    return typeof value === "number" && Number.isFinite(value)
        ? value
        : undefined;
}

function isHtmlCanvasLike(
    canvas: HTMLCanvasElement | OffscreenCanvas,
): canvas is HtmlCanvasLike {
    return (
        "addEventListener" in canvas &&
        "removeEventListener" in canvas &&
        typeof canvas.addEventListener === "function" &&
        typeof canvas.removeEventListener === "function"
    );
}

function isCanvasSizeLike(
    canvas: HTMLCanvasElement | OffscreenCanvas,
): canvas is (HTMLCanvasElement | OffscreenCanvas) & CanvasSizeLike {
    return (
        "width" in canvas &&
        "height" in canvas &&
        typeof canvas.width === "number" &&
        typeof canvas.height === "number"
    );
}

function isCanvasContextLike(
    canvas: HTMLCanvasElement | OffscreenCanvas,
): canvas is (HTMLCanvasElement | OffscreenCanvas) & CanvasContextLike {
    return "getContext" in canvas && typeof canvas.getContext === "function";
}

function isWebGpuCanvasContextLike(
    context: unknown,
): context is WebGpuCanvasContextLike {
    return (
        typeof context === "object" &&
        context !== null &&
        "configure" in context &&
        typeof (context as { configure?: unknown }).configure === "function" &&
        "getCurrentTexture" in context &&
        typeof (context as { getCurrentTexture?: unknown }).getCurrentTexture ===
            "function"
    );
}

function getWebGpuRoot(): WebGpuRootLike | undefined {
    const root = globalThis as typeof globalThis & { navigator?: unknown };
    const navigator = root.navigator;
    if (typeof navigator !== "object" || navigator === null || !("gpu" in navigator)) {
        return undefined;
    }
    const gpu = (navigator as { gpu?: unknown }).gpu;
    if (typeof gpu !== "object" || gpu === null) return undefined;
    const candidate = gpu as {
        requestAdapter?: unknown;
        getPreferredCanvasFormat?: unknown;
    };
    if (
        typeof candidate.requestAdapter !== "function" ||
        typeof candidate.getPreferredCanvasFormat !== "function"
    ) {
        return undefined;
    }
    return candidate as WebGpuRootLike;
}

function detectWebGpuBackend(): boolean {
    return getWebGpuRoot() !== undefined;
}

function normalizeSurfaceDimension(value: number): number {
    if (!Number.isFinite(value) || value <= 0) return 1;
    return Math.max(1, Math.round(value));
}

function createGfxService(config: GfxConfig): GfxService {
    const debug = config.debug ?? false;
    const canvas = config.canvas;
    const snapshot: GfxSnapshot = {
        backend: "none",
        state: "unavailable",
        caps: {},
        requestedBackend: "auto",
        selectedBackend: "none",
        detectedBackends: [],
    };
    let runtime: GfxRuntime | undefined;
    let pendingState: GfxSnapshot["state"] | undefined;
    let pendingLostBackend: GfxBackend | undefined;
    let onContextLost: EventListener | undefined;
    let onContextRestored: EventListener | undefined;
    let webGl2ContextRestored = false;
    let webGpuGeneration = 0;
    let recoveryGeneration = 0;
    let recoveryInFlight = false;
    let configuredWebGpuSurface: ConfiguredWebGpuSurface | undefined;

    function detachWebGl2LossListeners(): void {
        if (!isHtmlCanvasLike(canvas)) return;
        if (onContextLost) {
            canvas.removeEventListener("webglcontextlost", onContextLost);
        }
        if (onContextRestored) {
            canvas.removeEventListener("webglcontextrestored", onContextRestored);
        }
        onContextLost = undefined;
        onContextRestored = undefined;
        webGl2ContextRestored = false;
    }

    function attachWebGl2LossListeners(): void {
        if (!isHtmlCanvasLike(canvas)) return;
        detachWebGl2LossListeners();
        onContextLost = (event: Event) => {
            event.preventDefault?.();
            pendingState = "lost";
            pendingLostBackend = "webgl2";
            webGl2ContextRestored = false;
            clearConfiguredSurface();
        };
        onContextRestored = () => {
            webGl2ContextRestored = true;
        };
        canvas.addEventListener("webglcontextlost", onContextLost);
        canvas.addEventListener("webglcontextrestored", onContextRestored);
    }

    function resetSnapshot(): void {
        snapshot.backend = "none";
        snapshot.state = "unavailable";
        snapshot.caps = {};
        snapshot.requestedBackend = "auto";
        snapshot.selectedBackend = "none";
        snapshot.fallbackBackend = undefined;
        snapshot.unavailableBackend = undefined;
        snapshot.detectedBackends = [];
        snapshot.lostBackend = undefined;
    }

    function clearConfiguredSurface(): void {
        configuredWebGpuSurface = undefined;
    }

    function releaseRuntime(): void {
        detachWebGl2LossListeners();
        if (runtime?.backend === "webgpu") {
            runtime.context.unconfigure?.();
        }
        runtime = undefined;
        clearConfiguredSurface();
    }

    function tryAcquireWebGl2(): GfxWebGl2Runtime | undefined {
        if (!isCanvasContextLike(canvas)) return undefined;
        const gl = canvas.getContext("webgl2") as WebGL2RenderingContext | null;
        if (!gl) return undefined;

        return {
            backend: "webgl2",
            caps: {
                maxTextureSize: readFiniteCapability(
                    gl.getParameter(gl.MAX_TEXTURE_SIZE),
                ),
                maxUniformBufferSize: readFiniteCapability(
                    gl.getParameter(gl.MAX_UNIFORM_BLOCK_SIZE),
                ),
            },
            handle: gl,
        };
    }

    async function tryAcquireWebGpu(): Promise<GfxWebGpuRuntime | undefined> {
        const gpu = getWebGpuRoot();
        if (!gpu || !isCanvasContextLike(canvas)) return undefined;

        try {
            const adapter = await gpu.requestAdapter();
            if (!adapter) return undefined;
            const device = await adapter.requestDevice();
            const context = canvas.getContext("webgpu");
            if (!isWebGpuCanvasContextLike(context)) return undefined;

            const format = gpu.getPreferredCanvasFormat();
            const limits = device.limits ?? adapter.limits;
            const generation = ++webGpuGeneration;
            device.lost.then(() => {
                if (
                    webGpuGeneration !== generation ||
                    runtime?.backend !== "webgpu"
                ) {
                    return;
                }
                pendingState = "lost";
                pendingLostBackend = "webgpu";
            });

            return {
                backend: "webgpu",
                adapter,
                device,
                context,
                format,
                caps: {
                    maxTextureSize: readFiniteCapability(
                        limits?.maxTextureDimension2D,
                    ),
                    maxUniformBufferSize: readFiniteCapability(
                        limits?.maxUniformBufferBindingSize,
                    ),
                    maxBufferSize: readFiniteCapability(limits?.maxBufferSize),
                },
            };
        } catch {
            return undefined;
        }
    }

    function selectRuntime(nextRuntime: GfxRuntime): void {
        runtime = nextRuntime;
        snapshot.backend = nextRuntime.backend;
        snapshot.selectedBackend = nextRuntime.backend;
        snapshot.state = "ok";
        snapshot.caps = nextRuntime.caps;
        snapshot.lostBackend = undefined;
        pendingState = undefined;
        pendingLostBackend = undefined;
        clearConfiguredSurface();
        if (nextRuntime.backend === "webgl2") {
            attachWebGl2LossListeners();
        }
    }

    const lifecycle = createLifecycle({
        tag: "GfxService",
        debug,
        onStart: async () => {
            resetSnapshot();
            snapshot.detectedBackends = detectWebGpuBackend() ? ["webgpu"] : [];
            clearConfiguredSurface();
            const webGpuRuntime = await tryAcquireWebGpu();
            if (webGpuRuntime) {
                selectRuntime(webGpuRuntime);
                return;
            }

            if (snapshot.detectedBackends.includes("webgpu")) {
                snapshot.unavailableBackend = "webgpu";
            }

            const webGl2Runtime = tryAcquireWebGl2();
            if (!webGl2Runtime) {
                snapshot.unavailableBackend = "webgl2";
                return;
            }

            if (snapshot.unavailableBackend === "webgpu") {
                snapshot.fallbackBackend = "webgl2";
            }
            selectRuntime(webGl2Runtime);
        },
        onStop: () => {
            webGpuGeneration++;
            recoveryGeneration++;
            recoveryInFlight = false;
            releaseRuntime();
            pendingState = undefined;
            pendingLostBackend = undefined;
            resetSnapshot();
        },
        onDispose: () => {
            webGpuGeneration++;
            recoveryGeneration++;
            recoveryInFlight = false;
            releaseRuntime();
            pendingState = undefined;
            pendingLostBackend = undefined;
            resetSnapshot();
        },
    });

    function latch(): void {
        lifecycle.assertNotDisposed();
        if (!lifecycle.isRunning()) return;
        if (!pendingState) return;
        snapshot.state = pendingState;
        snapshot.lostBackend = pendingLostBackend;
        clearConfiguredSurface();
        pendingState = undefined;
        pendingLostBackend = undefined;
    }

    function selectRecoveredWebGl2Runtime(): boolean {
        const webGl2Runtime = tryAcquireWebGl2();
        if (!webGl2Runtime) return false;
        releaseRuntime();
        snapshot.unavailableBackend = undefined;
        snapshot.fallbackBackend = undefined;
        selectRuntime(webGl2Runtime);
        return true;
    }

    async function recoverAuto(
        generation: number,
        previousLostBackend: GfxBackend | undefined,
    ): Promise<void> {
        try {
            const detectedBackends: readonly GfxBackend[] = detectWebGpuBackend()
                ? ["webgpu"]
                : [];
            const webGpuRuntime = await tryAcquireWebGpu();
            if (
                recoveryGeneration !== generation ||
                !lifecycle.isRunning() ||
                snapshot.state !== "lost"
            ) {
                return;
            }

            if (webGpuRuntime) {
                releaseRuntime();
                snapshot.detectedBackends = detectedBackends;
                snapshot.unavailableBackend = undefined;
                snapshot.fallbackBackend = undefined;
                selectRuntime(webGpuRuntime);
                return;
            }

            const webGl2Runtime = tryAcquireWebGl2();
            if (
                recoveryGeneration !== generation ||
                !lifecycle.isRunning() ||
                snapshot.state !== "lost" ||
                !webGl2Runtime
            ) {
                return;
            }

            releaseRuntime();
            snapshot.detectedBackends = detectedBackends;
            snapshot.unavailableBackend = detectedBackends.includes("webgpu")
                ? "webgpu"
                : undefined;
            snapshot.fallbackBackend =
                previousLostBackend === "webgpu" ||
                snapshot.unavailableBackend === "webgpu"
                    ? "webgl2"
                    : undefined;
            selectRuntime(webGl2Runtime);
        } finally {
            if (recoveryGeneration === generation) {
                recoveryInFlight = false;
            }
        }
    }

    function recoverIfLost(): boolean {
        lifecycle.assertNotDisposed();
        if (!lifecycle.isRunning() || snapshot.state !== "lost") return false;
        if (
            snapshot.lostBackend === "webgl2" &&
            !detectWebGpuBackend() &&
            (webGl2ContextRestored || !isHtmlCanvasLike(canvas))
        ) {
            return selectRecoveredWebGl2Runtime();
        }
        if (recoveryInFlight) return false;
        recoveryInFlight = true;
        const generation = ++recoveryGeneration;
        void recoverAuto(generation, snapshot.lostBackend);
        return false;
    }

    function configureSurface(target: RenderTargetInfo): void {
        lifecycle.assertNotDisposed();
        if (!lifecycle.isRunning() || snapshot.state !== "ok") return;
        if (runtime?.backend !== "webgpu") return;

        const width = normalizeSurfaceDimension(target.w * target.dpr);
        const height = normalizeSurfaceDimension(target.h * target.dpr);
        const nextSurface: ConfiguredWebGpuSurface = {
            device: runtime.device,
            format: runtime.format,
            width,
            height,
            dpr: target.dpr,
        };
        if (
            configuredWebGpuSurface?.device === nextSurface.device &&
            configuredWebGpuSurface.format === nextSurface.format &&
            configuredWebGpuSurface.width === nextSurface.width &&
            configuredWebGpuSurface.height === nextSurface.height &&
            configuredWebGpuSurface.dpr === nextSurface.dpr
        ) {
            return;
        }

        if (isCanvasSizeLike(canvas)) {
            canvas.width = width;
            canvas.height = height;
        }
        runtime.context.configure({
            device: runtime.device,
            format: runtime.format,
            alphaMode: "premultiplied",
        });
        configuredWebGpuSurface = nextSurface;
    }

    function getRuntime(): GfxRuntime | undefined {
        lifecycle.assertNotDisposed();
        if (!lifecycle.isRunning() || snapshot.state !== "ok") {
            return undefined;
        }
        return runtime;
    }

    return Object.freeze({
        view: createGfxView(() => snapshot),
        start: lifecycle.start,
        stop: lifecycle.stop,
        latch,
        recoverIfLost,
        configureSurface,
        getRuntime,
        dispose: lifecycle.dispose,
    });
}

export function createGfx(config: GfxConfig): GfxService {
    return createGfxService(config);
}
