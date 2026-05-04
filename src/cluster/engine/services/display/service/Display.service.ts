import { createDisplaySnapshotDiff } from "../modules/SnapshotDiff.module";
import { createDisplayObserver } from "../modules/Observer.module";
import { createDisplaySurface } from "../modules/Surface.module";
import { createDisplayDpr } from "../modules/Dpr.module";
import { createDisplayView } from "./Display.view";
import type {
    DisplayConfig,
    DisplayTools,
    DisplayView,
    DisplaySnapshot,
} from "./Display.types";
import type { Size, Rect, Vec2 } from "../../../types/geometry";
import {
    createLifecycle,
    type LifecycleActivePhase,
    type LifecycleLivePhase,
} from "../../../controllers/Lifecycle.controller";

export type DisplayService = Readonly<{
    view: DisplayView;
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    latch(): void;
    dispose(): Promise<boolean>;
}>;

function createDisplayService(config: DisplayConfig): DisplayService {
    if (!config.canvas) throw new Error("DisplayService: canvas is required");

    let pendingResize = true;
    let pendingFullscreen = true;

    const debug = config.debug ?? false;
    const canvas = config.canvas;
    const env = {
        win:
            config.platform?.window ??
            (typeof window !== "undefined" ? window : undefined),
        doc:
            config.platform?.document ??
            (typeof document !== "undefined" ? document : undefined),
        isHTML:
            typeof HTMLCanvasElement !== "undefined" &&
            canvas instanceof HTMLCanvasElement,
        isOffscreen:
            typeof OffscreenCanvas !== "undefined" &&
            canvas instanceof OffscreenCanvas,
    };
    const mode = config.options?.mode ?? (env.isOffscreen ? "fixed" : "auto");
    const snapshot: DisplaySnapshot = {
        w: 1,
        h: 1,
        dpr: 1,
        rev: 0,
        changed: false,
        cssW: undefined,
        cssH: undefined,
        rect: undefined,
        isFullscreen: undefined,
    };
    const fixedSize: Size = {
        w: 1,
        h: 1,
    };
    const displaySnapshotDiff = createDisplaySnapshotDiff();
    const displaySurface = createDisplaySurface();
    const displayObserver = createDisplayObserver({
        canvas,
        isHTML: env.isHTML,
        window: env.win,
        document: env.doc,
        onFullscreen: () => markFullscreenPending(),
        onResize: () => markResizePending(),
    });
    const displayDpr = createDisplayDpr({
        dpr: config.options?.dpr,
        window: env.win,
    });
    const tools: DisplayTools = {
        cssToSurface: (x: number, y: number, out?: Vec2): Vec2 => {
            const cssW = snapshot.cssW ?? snapshot.w / snapshot.dpr;
            const cssH = snapshot.cssH ?? snapshot.h / snapshot.dpr;
            const sx = snapshot.w / cssW;
            const sy = snapshot.h / cssH;
            const result = out ?? { x: 0, y: 0 };
            result.x = x * sx;
            result.y = y * sy;

            return result;
        },
        surfaceToCss: (x: number, y: number, out?: Vec2): Vec2 => {
            const cssW = snapshot.cssW ?? snapshot.w / snapshot.dpr;
            const cssH = snapshot.cssH ?? snapshot.h / snapshot.dpr;
            const sx = snapshot.w / cssW;
            const sy = snapshot.h / cssH;
            const result = out ?? { x: 0, y: 0 };
            result.x = x / sx;
            result.y = y / sy;

            return result;
        },
        surfaceToClient: (x: number, y: number, out?: Vec2): Vec2 => {
            const rect = getRectOrFallback();
            const css = tools.surfaceToCss(x, y);
            const result = out ?? { x: 0, y: 0 };
            result.x = css.x + rect.left;
            result.y = css.y + rect.top;

            return result;
        },
        clientToSurface: (
            clientX: number,
            clientY: number,
            out?: Vec2,
        ): Vec2 => {
            const rect = getRectOrFallback();
            const cssLocalX = clientX - rect.left;
            const cssLocalY = clientY - rect.top;

            return tools.cssToSurface(cssLocalX, cssLocalY, out);
        },
    };

    const getRectOrFallback = (): Rect => {
        if (snapshot.rect) return snapshot.rect;
        if (debug) {
            throw new Error("DisplayView.rect is undefined");
        }

        const cssW = snapshot.cssW ?? snapshot.w / snapshot.dpr;
        const cssH = snapshot.cssH ?? snapshot.h / snapshot.dpr;

        return {
            left: 0,
            top: 0,
            width: cssW,
            height: cssH,
        };
    };

    const markResizePending = () => {
        pendingResize = true;
    };

    const markFullscreenPending = () => {
        pendingFullscreen = true;
        pendingResize = true;
    };

    const handleStart = () => {
        const configSize = config.options?.size ?? {
            w: canvas.width,
            h: canvas.height,
        };
        fixedSize.w = Math.max(1, Math.round(configSize.w));
        fixedSize.h = Math.max(1, Math.round(configSize.h));

        displayObserver.attach();
        markResizePending();
        markFullscreenPending();
    };

    const handleStop = (_from: LifecycleActivePhase) => {
        displayObserver.detach();
    };

    const handleDispose = (_from: LifecycleLivePhase) => {
        displayObserver.detach();
    };

    const lifecycle = createLifecycle({
        tag: "DisplayService",
        debug,
        onStart: handleStart,
        onStop: handleStop,
        onDispose: handleDispose,
    });

    function latch() {
        lifecycle.assertNotDisposed();
        if (!lifecycle.isRunning()) return;

        const { dpr: currentDpr, changed: dprChanged } = displayDpr.poll();
        if (dprChanged) pendingResize = true;

        if (!pendingResize && !pendingFullscreen) {
            snapshot.changed = false;
            return;
        }

        const prev = {
            w: snapshot.w,
            h: snapshot.h,
            dpr: snapshot.dpr,
            rev: snapshot.rev,
            changed: snapshot.changed,
            cssW: snapshot.cssW,
            cssH: snapshot.cssH,
            rect: snapshot.rect,
            isFullscreen: snapshot.isFullscreen,
        };

        if (pendingFullscreen) {
            snapshot.isFullscreen =
                env.isHTML && env.doc
                    ? env.doc.fullscreenElement === canvas
                    : undefined;
            pendingFullscreen = false;
        }

        if (pendingResize) {
            if (mode === "fixed") {
                displaySurface.applyFixed({
                    canvas,
                    currentDpr,
                    isHTML: env.isHTML,
                    fixedW: fixedSize.w,
                    fixedH: fixedSize.h,
                    metrics: snapshot,
                    debug,
                });
            }

            if (mode === "auto" && env.isHTML) {
                displaySurface.applyAuto({
                    canvas,
                    currentDpr,
                    metrics: snapshot,
                    debug,
                });
            }

            pendingResize = false;
        }

        displaySnapshotDiff.apply(prev, snapshot);
    }

    return Object.freeze({
        view: createDisplayView(() => snapshot, tools),
        start: lifecycle.start,
        latch,
        stop: lifecycle.stop,
        dispose: lifecycle.dispose,
    });
}

export function createDisplay(config: DisplayConfig): DisplayService {
    return createDisplayService(config);
}
