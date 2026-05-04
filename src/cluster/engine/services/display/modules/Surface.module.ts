import type { Rect } from "../../../types/geometry";

enum ErrorMsg {
    CANVAS_SIZE_CHANGED = "canvas size has changed from external code",
    NON_UNIFORM_SCALING = "non-uniform scaling: conversions must use sx/sy separately",
}

const EPS = 1e-6;

type DisplaySurfaceMetrics = {
    w: number;
    h: number;
    dpr: number;
    cssW?: number | undefined;
    cssH?: number | undefined;
    rect?: Rect | undefined;
};

export type DisplaySurfaceModule = Readonly<{
    applyAuto(args: {
        canvas: HTMLCanvasElement | OffscreenCanvas;
        currentDpr: number;
        metrics: DisplaySurfaceMetrics;
        debug?: boolean;
    }): void;

    applyFixed(args: {
        canvas: HTMLCanvasElement | OffscreenCanvas;
        currentDpr: number;
        fixedW: number;
        fixedH: number;
        isHTML: boolean;
        metrics: DisplaySurfaceMetrics;
        debug?: boolean;
    }): void;
}>;

export function createDisplaySurface(): DisplaySurfaceModule {
    function applyAuto(args: {
        canvas: HTMLCanvasElement | OffscreenCanvas;
        currentDpr: number;
        metrics: DisplaySurfaceMetrics;
        debug?: boolean;
    }) {
        const { canvas, debug, metrics, currentDpr } = args;

        const htmlCanvas = canvas as HTMLCanvasElement;
        const rect = htmlCanvas.getBoundingClientRect();

        const measurable =
            Number.isFinite(rect.width) &&
            Number.isFinite(rect.height) &&
            rect.width > 0 &&
            rect.height > 0;

        if (measurable) {
            const nextW = Math.max(1, Math.round(rect.width * currentDpr));
            const nextH = Math.max(1, Math.round(rect.height * currentDpr));
            const expectedSameAsPrev =
                nextW === metrics.w && nextH === metrics.h;

            if (
                debug &&
                expectedSameAsPrev &&
                (htmlCanvas.width !== nextW || htmlCanvas.height !== nextH)
            ) {
                console.warn(ErrorMsg.CANVAS_SIZE_CHANGED);
            }

            if (htmlCanvas.width !== nextW || htmlCanvas.height !== nextH) {
                htmlCanvas.width = nextW;
                htmlCanvas.height = nextH;
            }

            const sx = nextW / rect.width;
            const sy = nextH / rect.height;
            if (debug && Math.abs(sx - sy) > EPS) {
                console.warn(ErrorMsg.NON_UNIFORM_SCALING);
            }

            metrics.w = nextW;
            metrics.h = nextH;
            metrics.dpr = sx;
            metrics.cssW = rect.width;
            metrics.cssH = rect.height;
            metrics.rect = {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
            };
            return;
        }

        const hadPrev = metrics.w > 1 && metrics.h > 1;
        if (!hadPrev) {
            metrics.w = 1;
            metrics.h = 1;
            if (htmlCanvas.width !== 1 || htmlCanvas.height !== 1) {
                htmlCanvas.width = 1;
                htmlCanvas.height = 1;
            }
        }

        metrics.dpr = currentDpr;
        metrics.cssW = undefined;
        metrics.cssH = undefined;
        metrics.rect = undefined;
    }

    function applyFixed(args: {
        canvas: HTMLCanvasElement | OffscreenCanvas;
        currentDpr: number;
        fixedW: number;
        fixedH: number;
        isHTML: boolean;
        metrics: DisplaySurfaceMetrics;
        debug?: boolean;
    }) {
        const { canvas, debug, metrics, currentDpr, isHTML, fixedW, fixedH } =
            args;
        const expectedW = Math.max(1, Math.round(fixedW));
        const expectedH = Math.max(1, Math.round(fixedH));

        if (
            debug &&
            (canvas.width !== expectedW || canvas.height !== expectedH)
        ) {
            console.warn(ErrorMsg.CANVAS_SIZE_CHANGED);
        }

        if (canvas.width !== expectedW || canvas.height !== expectedH) {
            canvas.width = expectedW;
            canvas.height = expectedH;
        }

        metrics.w = canvas.width;
        metrics.h = canvas.height;

        if (isHTML) {
            const htmlCanvas = canvas as HTMLCanvasElement;
            const rect = htmlCanvas.getBoundingClientRect();
            const measurable =
                Number.isFinite(rect.width) &&
                Number.isFinite(rect.height) &&
                rect.width > 0 &&
                rect.height > 0;

            if (measurable) {
                metrics.cssW = rect.width;
                metrics.cssH = rect.height;
                metrics.rect = {
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height,
                };

                const sx = canvas.width / rect.width;
                const sy = canvas.height / rect.height;
                if (debug && Math.abs(sx - sy) > EPS) {
                    console.warn(ErrorMsg.NON_UNIFORM_SCALING);
                }

                metrics.dpr = sx;
                return;
            }
        }

        metrics.dpr = currentDpr;
        metrics.cssW = undefined;
        metrics.cssH = undefined;
        metrics.rect = undefined;
    }

    return Object.freeze({
        applyAuto,
        applyFixed,
    });
}
