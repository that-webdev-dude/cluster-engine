export type DisplayObserverModule = Readonly<{
    attach(): void;
    detach(): void;
}>;

export function createDisplayObserver(args: {
    canvas: HTMLCanvasElement | OffscreenCanvas;
    isHTML: boolean;
    window?: Window;
    document?: Document;
    onFullscreen: () => void;
    onResize: () => void;
}): DisplayObserverModule {
    let resizeObserver: ResizeObserver | undefined;
    let onFullscreenChange: (() => void) | undefined;
    let onWindowResize: (() => void) | undefined;

    function attach() {
        if (args.isHTML && typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(() => args.onResize());
            resizeObserver.observe(args.canvas as HTMLCanvasElement);
        }

        if (args.window) {
            onWindowResize = () => args.onResize();
            args.window.addEventListener("resize", onWindowResize);
        }

        if (args.document) {
            onFullscreenChange = () => args.onFullscreen();
            args.document.addEventListener(
                "fullscreenchange",
                onFullscreenChange,
            );
        }
    }

    function detach() {
        resizeObserver?.disconnect();
        resizeObserver = undefined;

        if (onWindowResize) {
            args.window?.removeEventListener("resize", onWindowResize);
            onWindowResize = undefined;
        }

        if (onFullscreenChange) {
            args.document?.removeEventListener(
                "fullscreenchange",
                onFullscreenChange,
            );
            onFullscreenChange = undefined;
        }
    }

    return Object.freeze({ attach, detach });
}
