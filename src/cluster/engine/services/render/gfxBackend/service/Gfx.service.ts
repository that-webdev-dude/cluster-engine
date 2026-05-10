import { createLifecycle } from "../../../../controllers/Lifecycle.controller";
import { createGfxView } from "./Gfx.view";
import type { GfxCaps, GfxConfig, GfxSnapshot, GfxView } from "./Gfx.types";

export type GfxRuntime = Readonly<{
    backend: "webgl2";
    caps: GfxCaps;
    handle: WebGL2RenderingContext;
}>;

export type GfxService = Readonly<{
    view: GfxView;
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    latch(): void;
    getRuntime(): GfxRuntime | undefined;
    dispose(): Promise<boolean>;
}>;

type HtmlCanvasLike = HTMLCanvasElement & {
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
};

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

function createGfxService(config: GfxConfig): GfxService {
    const debug = config.debug ?? false;
    const canvas = config.canvas;
    const snapshot: GfxSnapshot = {
        backend: "none",
        state: "unavailable",
        caps: {},
    };
    let runtime: GfxRuntime | undefined;
    let pendingState: GfxSnapshot["state"] | undefined;
    let onContextLost: EventListener | undefined;

    function detachWebGl2LossListener(): void {
        if (!onContextLost || !isHtmlCanvasLike(canvas)) return;
        canvas.removeEventListener("webglcontextlost", onContextLost);
        onContextLost = undefined;
    }

    function attachWebGl2LossListener(): void {
        if (!isHtmlCanvasLike(canvas)) return;
        detachWebGl2LossListener();
        onContextLost = (event: Event) => {
            event.preventDefault?.();
            pendingState = "lost";
        };
        canvas.addEventListener("webglcontextlost", onContextLost);
    }

    function tryAcquireWebGl2(): GfxRuntime | undefined {
        if (typeof canvas.getContext !== "function") return undefined;
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

    const lifecycle = createLifecycle({
        tag: "GfxService",
        debug,
        onStart: () => {
            runtime = tryAcquireWebGl2();
            if (!runtime) {
                snapshot.backend = "none";
                snapshot.state = "unavailable";
                snapshot.caps = {};
                return;
            }

            snapshot.backend = runtime.backend;
            snapshot.state = "ok";
            snapshot.caps = runtime.caps;
            pendingState = undefined;
            attachWebGl2LossListener();
        },
        onStop: () => {
            detachWebGl2LossListener();
            runtime = undefined;
            pendingState = undefined;
            snapshot.backend = "none";
            snapshot.state = "unavailable";
            snapshot.caps = {};
        },
        onDispose: () => {
            detachWebGl2LossListener();
            runtime = undefined;
            pendingState = undefined;
            snapshot.backend = "none";
            snapshot.state = "unavailable";
            snapshot.caps = {};
        },
    });

    function latch(): void {
        lifecycle.assertNotDisposed();
        if (!lifecycle.isRunning()) return;
        if (!pendingState) return;
        snapshot.state = pendingState;
        pendingState = undefined;
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
        getRuntime,
        dispose: lifecycle.dispose,
    });
}

export function createGfx(config: GfxConfig): GfxService {
    return createGfxService(config);
}
