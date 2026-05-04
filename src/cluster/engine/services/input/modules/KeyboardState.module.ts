import type { KeyCode } from "../service/Input.types";

export type KeyboardStateModule = Readonly<{
    attach(): void;
    detach(): void;
    latch(): void;
    forEachDown(fn: (code: KeyCode) => void): void;
    forEachPressed(fn: (code: KeyCode) => void): void;
    forEachReleased(fn: (code: KeyCode) => void): void;
}>;

type KeyboardHandler = EventListener | undefined;
type VisibilityHandler = (() => void) | undefined;
type FocusHandler = (() => void) | undefined;

export function createKeyboardStateModule(config: {
    keyboardTarget?: EventTarget;
    window?: Window;
    document?: Document;
    ignoreWhenTyping?: boolean;
}): KeyboardStateModule {
    const ignoreWhenTyping = config.ignoreWhenTyping ?? true;
    const nonText = new Set([
        "button",
        "checkbox",
        "radio",
        "range",
        "file",
        "color",
        "submit",
        "reset",
        "image",
        "hidden",
    ]);

    let downNext = new Set<KeyCode>();
    let pressedNext = new Set<KeyCode>();
    let releasedNext = new Set<KeyCode>();
    let downFrame = new Set<KeyCode>();
    let pressedFrame = new Set<KeyCode>();
    let releasedFrame = new Set<KeyCode>();
    let onDown: KeyboardHandler;
    let onReleased: KeyboardHandler;
    let onVisibilityChange: VisibilityHandler;
    let onClearDown: FocusHandler;
    let attachedKeyboardTarget: EventTarget | undefined;
    let attached = false;

    const shouldIgnore = (doc?: Document): boolean => {
        if (!doc) return false;

        const element = doc.activeElement;
        if (!element) return false;

        const tagName =
            "tagName" in element && typeof element.tagName === "string"
                ? element.tagName.toLowerCase()
                : "";

        if (tagName === "textarea") return true;

        const maybeEditable = element as { isContentEditable?: boolean };
        if (maybeEditable.isContentEditable === true) return true;

        if (tagName === "input") {
            const maybeInput = element as {
                type?: string;
                getAttribute?: (name: string) => string | null;
            };
            const inputType = (
                maybeInput.type ??
                maybeInput.getAttribute?.("type") ??
                "text"
            ).toLowerCase();

            return !nonText.has(inputType);
        }

        return false;
    };

    const clearDownAndQueueReleased = () => {
        for (const code of downNext) {
            releasedNext.add(code);
            pressedNext.delete(code);
        }
        downNext.clear();
    };

    const clearFrameState = () => {
        downFrame.clear();
        pressedFrame.clear();
        releasedFrame.clear();
    };

    const clearAllState = () => {
        downNext.clear();
        pressedNext.clear();
        releasedNext.clear();
        clearFrameState();
    };

    const readCode = (event: Event): KeyCode | undefined => {
        const maybe = event as { code?: unknown };
        return typeof maybe.code === "string" ? maybe.code : undefined;
    };

    const resolveKeyboardTarget = (): EventTarget | undefined => {
        return config.keyboardTarget ?? config.window ?? config.document;
    };

    function attach(): void {
        if (attached) return;

        clearAllState();

        onDown = (event) => {
            if (ignoreWhenTyping && shouldIgnore(config.document)) {
                clearDownAndQueueReleased();
                return;
            }

            const code = readCode(event);
            if (!code) return;

            if (!downNext.has(code)) {
                downNext.add(code);
                pressedNext.add(code);
            }
        };

        onReleased = (event) => {
            if (ignoreWhenTyping && shouldIgnore(config.document)) {
                clearDownAndQueueReleased();
                return;
            }

            const code = readCode(event);
            if (!code) return;

            if (downNext.delete(code)) {
                releasedNext.add(code);
            }
        };

        onVisibilityChange = () => {
            if (!config.document) return;
            if (config.document.visibilityState === "hidden") {
                clearDownAndQueueReleased();
            }
        };

        onClearDown = () => {
            clearDownAndQueueReleased();
        };

        attachedKeyboardTarget = resolveKeyboardTarget();
        if (attachedKeyboardTarget) {
            attachedKeyboardTarget.addEventListener("keydown", onDown);
            attachedKeyboardTarget.addEventListener("keyup", onReleased);
        }

        if (config.window) {
            config.window.addEventListener("blur", onClearDown);
        }

        if (config.document) {
            config.document.addEventListener(
                "visibilitychange",
                onVisibilityChange,
            );
        }

        attached = true;
    }

    function detach(): void {
        if (!attached) return;

        if (onDown && attachedKeyboardTarget) {
            attachedKeyboardTarget.removeEventListener("keydown", onDown);
        }
        if (onReleased && attachedKeyboardTarget) {
            attachedKeyboardTarget.removeEventListener("keyup", onReleased);
        }
        if (onClearDown && config.window) {
            config.window.removeEventListener("blur", onClearDown);
        }
        if (onVisibilityChange && config.document) {
            config.document.removeEventListener(
                "visibilitychange",
                onVisibilityChange,
            );
        }

        onDown = undefined;
        onReleased = undefined;
        onVisibilityChange = undefined;
        onClearDown = undefined;
        attachedKeyboardTarget = undefined;
        clearAllState();
        attached = false;
    }

    function latch(): void {
        if (!attached) return;

        clearFrameState();

        downNext.forEach((code) => downFrame.add(code));
        pressedNext.forEach((code) => pressedFrame.add(code));
        releasedNext.forEach((code) => releasedFrame.add(code));

        pressedNext.clear();
        releasedNext.clear();
    }

    function forEachDown(fn: (code: KeyCode) => void): void {
        for (const code of downFrame) fn(code);
    }

    function forEachPressed(fn: (code: KeyCode) => void): void {
        for (const code of pressedFrame) fn(code);
    }

    function forEachReleased(fn: (code: KeyCode) => void): void {
        for (const code of releasedFrame) fn(code);
    }

    return Object.freeze({
        attach,
        detach,
        latch,
        forEachDown,
        forEachPressed,
        forEachReleased,
    });
}
