import type { Vec2 } from "../../../types/geometry";
import type {
    ButtonsMask,
    InputFrame,
    MouseButton,
    PointerCapturePolicy,
    PointerId,
    PointerSnapshot,
    PointerType,
} from "../service/Input.types";

type PointerRuntime = {
    id: PointerId;
    type: PointerType;
    isPrimaryHint: boolean;
    clientX: number;
    clientY: number;
    buttons: ButtonsMask;
    pressure?: number;
    tiltX?: number;
    tiltY?: number;
    twist?: number;
};

type PointerStateConfig = {
    canvas?: HTMLCanvasElement | OffscreenCanvas;
    window?: Window;
    document?: Document;
    pointerTarget?: EventTarget;
    wheelTarget?: EventTarget;
    capturePolicy?: PointerCapturePolicy;
    contextMenuPolicy?: "suppressOnCanvas" | "allow";
    wheelPreventDefault?: boolean;
    touchPreventDefault?: boolean;
};

type PointerCaptureCapableTarget = EventTarget & {
    setPointerCapture?: (pointerId: number) => void;
    releasePointerCapture?: (pointerId: number) => void;
    hasPointerCapture?: (pointerId: number) => boolean;
};

type PointerHandler = EventListener | undefined;
type WheelHandler = EventListener | undefined;

const SUPPORTED_POINTERS: readonly PointerType[] = ["mouse", "pen", "touch"];
const POINTER_BUTTONS: readonly MouseButton[] = [0, 1, 2, 3, 4];
const BUTTON_MASK_BY_BUTTON: Record<MouseButton, number> = {
    0: 1,
    1: 4,
    2: 2,
    3: 8,
    4: 16,
};

export type PointerStateModule = Readonly<{
    attach(): void;
    detach(): void;
    latch(frame: InputFrame): void;
    primary(): PointerSnapshot | undefined;
    wheelX(): number;
    wheelY(): number;
    btnDown(button: MouseButton): boolean;
    btnPressed(button: MouseButton): boolean;
    btnReleased(button: MouseButton): boolean;
    count(): number;
    has(id: PointerId): boolean;
    get(id: PointerId, out: PointerSnapshot): boolean;
    forEach(
        out: PointerSnapshot,
        fn: (pointer: Readonly<PointerSnapshot>) => void,
    ): void;
}>;

type PointerEventLike = Event & {
    pointerId?: unknown;
    pointerType?: unknown;
    isPrimary?: unknown;
    clientX?: unknown;
    clientY?: unknown;
    buttons?: unknown;
    pressure?: unknown;
    tiltX?: unknown;
    tiltY?: unknown;
    twist?: unknown;
    button?: unknown;
    cancelable: boolean;
    preventDefault(): void;
};

type ValidPointerEventLike = PointerEventLike & {
    pointerId: number;
    pointerType: PointerType;
};

type WheelEventLike = Event & {
    deltaX?: unknown;
    deltaY?: unknown;
    cancelable: boolean;
    preventDefault(): void;
};

type ValidWheelEventLike = WheelEventLike & {
    deltaX: number;
    deltaY: number;
};

function copyPointer(source: PointerSnapshot, out: PointerSnapshot): void {
    out.id = source.id;
    out.type = source.type;
    out.isPrimary = source.isPrimary;
    out.x = source.x;
    out.y = source.y;
    out.dx = source.dx;
    out.dy = source.dy;
    out.clientX = source.clientX;
    out.clientY = source.clientY;
    out.buttons = source.buttons;
    out.pressure = source.pressure;
    out.tiltX = source.tiltX;
    out.tiltY = source.tiltY;
    out.twist = source.twist;
}

export function createPointerStateModule(
    config: PointerStateConfig,
): PointerStateModule {
    let pointersNext = new Map<PointerId, PointerRuntime>();
    let pointersFrame = new Map<PointerId, PointerSnapshot>();
    let pointersFramePrev = new Map<PointerId, PointerSnapshot>();

    let btnDownByPointerNext = new Map<PointerId, Set<MouseButton>>();
    let btnPressedByPointerNext = new Map<PointerId, Set<MouseButton>>();
    let btnReleasedByPointerNext = new Map<PointerId, Set<MouseButton>>();
    let btnDownFrame = new Set<MouseButton>();
    let btnPressedFrame = new Set<MouseButton>();
    let btnReleasedFrame = new Set<MouseButton>();
    let btnReleasedForcedNext = new Set<MouseButton>();
    let activeTouchIds = new Set<PointerId>();

    let primaryIdNext: PointerId | undefined;
    let primaryIdFrame: PointerId | undefined;
    let lastActivePointerId: PointerId | undefined;
    let wheelXNext = 0;
    let wheelYNext = 0;
    let wheelXFrame = 0;
    let wheelYFrame = 0;
    let onPointerDown: PointerHandler;
    let onPointerMove: PointerHandler;
    let onPointerCancel: PointerHandler;
    let onPointerUp: PointerHandler;
    let onWindowBlur: PointerHandler;
    let onVisibilityChange: PointerHandler;
    let onContextMenu: PointerHandler;
    let onWheel: WheelHandler;
    let attachedPointerTarget: EventTarget | undefined;
    let attachedWheelTarget: EventTarget | undefined;
    let attached = false;
    let effectiveCapturePolicy: PointerCapturePolicy = "none";
    let effectiveContextMenuPolicy: "suppressOnCanvas" | "allow" = "allow";
    let effectiveWheelPreventDefault = false;

    const touchPreventDefault = config.touchPreventDefault ?? false;
    const wheelOrigin: Vec2 = { x: 0, y: 0 };
    const wheelSurface: Vec2 = { x: 0, y: 0 };

    const isHTMLCanvas = (target?: EventTarget): target is HTMLCanvasElement => {
        return (
            typeof HTMLCanvasElement !== "undefined" &&
            target instanceof HTMLCanvasElement
        );
    };

    const getPointerTarget = (): EventTarget | undefined => {
        if (config.pointerTarget) return config.pointerTarget;
        if (
            typeof HTMLCanvasElement !== "undefined" &&
            config.canvas instanceof HTMLCanvasElement
        ) {
            return config.canvas;
        }
        return undefined;
    };

    const getWheelTarget = (
        pointerTarget?: EventTarget,
    ): EventTarget | undefined => {
        return config.wheelTarget ?? pointerTarget;
    };

    const getOrCreateButtonSet = (
        map: Map<PointerId, Set<MouseButton>>,
        id: PointerId,
    ): Set<MouseButton> => {
        let set = map.get(id);
        if (set) return set;

        set = new Set<MouseButton>();
        map.set(id, set);
        return set;
    };

    const forEachButton = (
        set: Set<MouseButton> | undefined,
        fn: (button: MouseButton) => void,
    ) => {
        if (!set) return;
        for (const button of set) fn(button);
    };

    const addDownButton = (id: PointerId, button: MouseButton) => {
        const down = getOrCreateButtonSet(btnDownByPointerNext, id);
        if (down.has(button)) return;

        down.add(button);
        getOrCreateButtonSet(btnPressedByPointerNext, id).add(button);
    };

    const removeDownButton = (id: PointerId, button: MouseButton) => {
        const down = btnDownByPointerNext.get(id);
        if (!down || !down.delete(button)) return;

        getOrCreateButtonSet(btnReleasedByPointerNext, id).add(button);
        if (down.size === 0) {
            btnDownByPointerNext.delete(id);
        }
    };

    const releaseAllDownButtons = (id: PointerId) => {
        const down = btnDownByPointerNext.get(id);
        if (!down) return;

        const released = getOrCreateButtonSet(btnReleasedByPointerNext, id);
        forEachButton(down, (button) => released.add(button));
        btnDownByPointerNext.delete(id);
    };

    const isButtonDownInMask = (buttons: ButtonsMask, button: MouseButton) => {
        return (buttons & BUTTON_MASK_BY_BUTTON[button]) !== 0;
    };

    const syncButtonsFromMask = (
        id: PointerId,
        previousButtons: ButtonsMask,
        nextButtons: ButtonsMask,
    ) => {
        for (const button of POINTER_BUTTONS) {
            const wasDown = isButtonDownInMask(previousButtons, button);
            const isDown = isButtonDownInMask(nextButtons, button);
            if (wasDown === isDown) continue;

            if (isDown) {
                addDownButton(id, button);
            } else {
                removeDownButton(id, button);
            }
        }
    };

    const isValidPointerType = (
        pointerType: unknown,
    ): pointerType is PointerType => {
        return (
            typeof pointerType === "string" &&
            SUPPORTED_POINTERS.includes(pointerType as PointerType)
        );
    };

    const toFiniteNumber = (value: unknown, fallback = 0): number => {
        return typeof value === "number" && Number.isFinite(value)
            ? value
            : fallback;
    };

    const tryPreventTouchDefault = (event: PointerEventLike) => {
        if (!touchPreventDefault) return;
        if (event.pointerType !== "touch") return;
        if (!event.cancelable) return;

        try {
            event.preventDefault();
        } catch (_error) {
            // Best-effort per spec; never throw.
        }
    };

    const tryPreventWheelDefault = (event: WheelEventLike) => {
        if (!effectiveWheelPreventDefault) return;
        if (!event.cancelable) return;

        try {
            event.preventDefault();
        } catch (_error) {
            // Best-effort per spec; never throw.
        }
    };

    const trySetPointerCapture = (pointerId: PointerId): void => {
        if (effectiveCapturePolicy !== "auto") return;

        const target = attachedPointerTarget as
            | PointerCaptureCapableTarget
            | undefined;
        if (!target || typeof target.setPointerCapture !== "function") return;

        try {
            target.setPointerCapture(pointerId);
        } catch (_error) {
            // Graceful degradation per spec.
        }
    };

    const tryReleasePointerCapture = (pointerId: PointerId): void => {
        if (effectiveCapturePolicy !== "auto") return;

        const target = attachedPointerTarget as
            | PointerCaptureCapableTarget
            | undefined;
        if (!target || typeof target.releasePointerCapture !== "function") {
            return;
        }

        try {
            if (
                typeof target.hasPointerCapture === "function" &&
                !target.hasPointerCapture(pointerId)
            ) {
                return;
            }
            target.releasePointerCapture(pointerId);
        } catch (_error) {
            // Graceful degradation per spec.
        }
    };

    const clearAllState = () => {
        pointersNext.clear();
        pointersFrame.clear();
        pointersFramePrev.clear();
        btnDownByPointerNext.clear();
        btnPressedByPointerNext.clear();
        btnReleasedByPointerNext.clear();
        btnDownFrame.clear();
        btnPressedFrame.clear();
        btnReleasedFrame.clear();
        btnReleasedForcedNext.clear();
        activeTouchIds.clear();
        primaryIdNext = undefined;
        primaryIdFrame = undefined;
        lastActivePointerId = undefined;
        wheelXNext = 0;
        wheelYNext = 0;
        wheelXFrame = 0;
        wheelYFrame = 0;
    };

    const clearDownAndQueueReleased = (): void => {
        for (const id of pointersNext.keys()) {
            tryReleasePointerCapture(id);
        }

        for (const [id, down] of btnDownByPointerNext) {
            const released = getOrCreateButtonSet(btnReleasedByPointerNext, id);
            forEachButton(down, (button) => {
                released.add(button);
                btnReleasedForcedNext.add(button);
            });
        }

        btnDownByPointerNext.clear();
        btnPressedByPointerNext.clear();
        activeTouchIds.clear();
        pointersNext.clear();
        primaryIdNext = undefined;
        lastActivePointerId = undefined;
    };

    const resolvePrimaryIdFromNext = (): PointerId | undefined => {
        for (const [id, pointer] of pointersNext) {
            if (pointer.isPrimaryHint) return id;
        }

        if (
            lastActivePointerId !== undefined &&
            pointersNext.has(lastActivePointerId)
        ) {
            return lastActivePointerId;
        }

        for (const [id] of pointersNext) {
            return id;
        }

        return undefined;
    };

    const updateRuntimeFromEvent = (
        runtime: PointerRuntime,
        event: PointerEventLike,
        pointerType: PointerType,
    ): void => {
        runtime.type = pointerType;
        runtime.isPrimaryHint = event.isPrimary === true;
        runtime.clientX = toFiniteNumber(event.clientX);
        runtime.clientY = toFiniteNumber(event.clientY);
        runtime.buttons = toFiniteNumber(event.buttons);
        runtime.pressure = toFiniteNumber(event.pressure, runtime.pressure);
        runtime.tiltX = toFiniteNumber(event.tiltX, runtime.tiltX);
        runtime.tiltY = toFiniteNumber(event.tiltY, runtime.tiltY);
        runtime.twist = toFiniteNumber(event.twist, runtime.twist);
    };

    const upsertRuntimePointer = (
        event: PointerEventLike,
        pointerType: PointerType,
    ): { runtime: PointerRuntime; previousButtons: ButtonsMask } => {
        const pointerId = toFiniteNumber(event.pointerId);
        const existing = pointersNext.get(pointerId);
        if (existing) {
            const previousButtons = existing.buttons;
            updateRuntimeFromEvent(existing, event, pointerType);
            return { runtime: existing, previousButtons };
        }

        const created: PointerRuntime = {
            id: pointerId,
            type: pointerType,
            isPrimaryHint: event.isPrimary === true,
            clientX: toFiniteNumber(event.clientX),
            clientY: toFiniteNumber(event.clientY),
            buttons: 0,
            pressure: toFiniteNumber(event.pressure, undefined),
            tiltX: toFiniteNumber(event.tiltX, undefined),
            tiltY: toFiniteNumber(event.tiltY, undefined),
            twist: toFiniteNumber(event.twist, undefined),
        };
        pointersNext.set(pointerId, created);

        const previousButtons = created.buttons;
        updateRuntimeFromEvent(created, event, pointerType);

        return { runtime: created, previousButtons };
    };

    const touchPress = (id: PointerId) => {
        if (activeTouchIds.has(id)) return;

        activeTouchIds.add(id);
        addDownButton(id, 0);
    };

    const touchRelease = (id: PointerId) => {
        if (!activeTouchIds.delete(id)) return;

        removeDownButton(id, 0);
    };

    const terminalPointerEvent = (event: PointerEventLike): void => {
        const id = toFiniteNumber(event.pointerId);
        tryReleasePointerCapture(id);

        const existing = pointersNext.get(id);
        if (!existing) return;

        if (existing.type === "touch") {
            touchRelease(id);
        } else {
            releaseAllDownButtons(id);
        }

        btnDownByPointerNext.delete(id);
        activeTouchIds.delete(id);
        pointersNext.delete(id);

        if (primaryIdNext === id) {
            primaryIdNext = resolvePrimaryIdFromNext();
        }
        if (lastActivePointerId === id && !pointersNext.has(id)) {
            lastActivePointerId = undefined;
        }
    };

    const updatePrimaryCandidate = (
        pointerId: PointerId,
        isPrimary: boolean,
    ) => {
        if (isPrimary) {
            primaryIdNext = pointerId;
        } else if (primaryIdNext === undefined) {
            primaryIdNext = resolvePrimaryIdFromNext();
        }

        lastActivePointerId = pointerId;
    };

    const asPointerEvent = (event: Event): ValidPointerEventLike | undefined => {
        const maybe = event as PointerEventLike;
        if (typeof maybe.pointerId !== "number") return undefined;
        if (!isValidPointerType(maybe.pointerType)) return undefined;

        return maybe as ValidPointerEventLike;
    };

    const asWheelEvent = (event: Event): ValidWheelEventLike | undefined => {
        const maybe = event as WheelEventLike;
        if (typeof maybe.deltaX !== "number") return undefined;
        if (typeof maybe.deltaY !== "number") return undefined;

        return maybe as ValidWheelEventLike;
    };

    function attach(): void {
        if (attached) return;

        attachedPointerTarget = getPointerTarget();
        attachedWheelTarget = getWheelTarget(attachedPointerTarget);
        if (!attachedPointerTarget && !attachedWheelTarget) return;

        effectiveCapturePolicy =
            config.capturePolicy ??
            (isHTMLCanvas(attachedPointerTarget) ? "auto" : "none");
        effectiveContextMenuPolicy =
            config.contextMenuPolicy ??
            (isHTMLCanvas(attachedPointerTarget)
                ? "suppressOnCanvas"
                : "allow");
        effectiveWheelPreventDefault =
            config.wheelPreventDefault ?? isHTMLCanvas(attachedWheelTarget);

        clearAllState();

        onPointerDown = (evt: Event) => {
            const pointer = asPointerEvent(evt);
            if (!pointer) return;

            tryPreventTouchDefault(pointer);

            const { runtime, previousButtons } = upsertRuntimePointer(
                pointer,
                pointer.pointerType,
            );

            if (runtime.type === "touch") {
                touchPress(runtime.id);
            } else {
                syncButtonsFromMask(
                    runtime.id,
                    previousButtons,
                    runtime.buttons,
                );
            }

            trySetPointerCapture(runtime.id);
            updatePrimaryCandidate(runtime.id, runtime.isPrimaryHint);
        };

        onPointerMove = (evt: Event) => {
            const pointer = asPointerEvent(evt);
            if (!pointer) return;

            tryPreventTouchDefault(pointer);

            const { runtime, previousButtons } = upsertRuntimePointer(
                pointer,
                pointer.pointerType,
            );
            if (runtime.type !== "touch") {
                syncButtonsFromMask(
                    runtime.id,
                    previousButtons,
                    runtime.buttons,
                );
            }

            updatePrimaryCandidate(runtime.id, runtime.isPrimaryHint);
        };

        onPointerUp = (evt: Event) => {
            const pointer = asPointerEvent(evt);
            if (!pointer) return;

            tryPreventTouchDefault(pointer);

            const { runtime, previousButtons } = upsertRuntimePointer(
                pointer,
                pointer.pointerType,
            );
            if (runtime.type !== "touch") {
                syncButtonsFromMask(
                    runtime.id,
                    previousButtons,
                    runtime.buttons,
                );
            }

            if (runtime.type === "touch") {
                lastActivePointerId = runtime.id;
                terminalPointerEvent(pointer);
                return;
            }

            tryReleasePointerCapture(runtime.id);
            updatePrimaryCandidate(runtime.id, runtime.isPrimaryHint);
        };

        onPointerCancel = (evt: Event) => {
            const pointer = asPointerEvent(evt);
            if (!pointer) return;

            tryPreventTouchDefault(pointer);
            upsertRuntimePointer(pointer, pointer.pointerType);
            terminalPointerEvent(pointer);
        };

        onVisibilityChange = () => {
            if (!config.document) return;
            if (config.document.visibilityState === "hidden") {
                clearDownAndQueueReleased();
            }
        };

        onWindowBlur = () => {
            clearDownAndQueueReleased();
        };

        onContextMenu = (evt: Event) => {
            if (effectiveContextMenuPolicy !== "suppressOnCanvas") return;
            if (!evt.cancelable) return;

            try {
                evt.preventDefault();
            } catch (_error) {
                // Best-effort per spec; never throw.
            }
        };

        onWheel = (evt: Event) => {
            const wheel = asWheelEvent(evt);
            if (!wheel) return;

            tryPreventWheelDefault(wheel);
            wheelXNext += wheel.deltaX;
            wheelYNext += wheel.deltaY;
        };

        if (attachedPointerTarget) {
            attachedPointerTarget.addEventListener("pointerdown", onPointerDown);
            attachedPointerTarget.addEventListener("pointermove", onPointerMove);
            attachedPointerTarget.addEventListener("pointerup", onPointerUp);
            attachedPointerTarget.addEventListener(
                "pointercancel",
                onPointerCancel,
            );
            attachedPointerTarget.addEventListener("contextmenu", onContextMenu);
        }

        if (attachedWheelTarget) {
            attachedWheelTarget.addEventListener("wheel", onWheel, {
                passive: !effectiveWheelPreventDefault,
            });
        }

        if (config.window) {
            config.window.addEventListener("blur", onWindowBlur);
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

        if (onPointerDown && attachedPointerTarget) {
            attachedPointerTarget.removeEventListener(
                "pointerdown",
                onPointerDown,
            );
        }
        if (onPointerMove && attachedPointerTarget) {
            attachedPointerTarget.removeEventListener(
                "pointermove",
                onPointerMove,
            );
        }
        if (onPointerUp && attachedPointerTarget) {
            attachedPointerTarget.removeEventListener("pointerup", onPointerUp);
        }
        if (onPointerCancel && attachedPointerTarget) {
            attachedPointerTarget.removeEventListener(
                "pointercancel",
                onPointerCancel,
            );
        }
        if (onContextMenu && attachedPointerTarget) {
            attachedPointerTarget.removeEventListener(
                "contextmenu",
                onContextMenu,
            );
        }
        if (onWheel && attachedWheelTarget) {
            attachedWheelTarget.removeEventListener("wheel", onWheel);
        }
        if (onWindowBlur && config.window) {
            config.window.removeEventListener("blur", onWindowBlur);
        }
        if (onVisibilityChange && config.document) {
            config.document.removeEventListener(
                "visibilitychange",
                onVisibilityChange,
            );
        }

        onPointerDown = undefined;
        onPointerMove = undefined;
        onPointerUp = undefined;
        onPointerCancel = undefined;
        onWindowBlur = undefined;
        onVisibilityChange = undefined;
        onContextMenu = undefined;
        onWheel = undefined;
        attachedPointerTarget = undefined;
        attachedWheelTarget = undefined;
        effectiveCapturePolicy = "none";
        effectiveContextMenuPolicy = "allow";
        effectiveWheelPreventDefault = false;
        clearAllState();
        attached = false;
    }

    function primary(): PointerSnapshot | undefined {
        if (primaryIdFrame === undefined) return undefined;
        return pointersFrame.get(primaryIdFrame);
    }

    function wheelX(): number {
        return wheelXFrame;
    }

    function wheelY(): number {
        return wheelYFrame;
    }

    function btnDown(button: MouseButton): boolean {
        return btnDownFrame.has(button);
    }

    function btnPressed(button: MouseButton): boolean {
        return btnPressedFrame.has(button);
    }

    function btnReleased(button: MouseButton): boolean {
        return btnReleasedFrame.has(button);
    }

    function latch(frame: InputFrame): void {
        if (!attached) return;

        primaryIdFrame = resolvePrimaryIdFromNext();
        pointersFramePrev.clear();
        for (const pointer of pointersFrame.values()) {
            pointersFramePrev.set(pointer.id, { ...pointer });
        }

        pointersFrame.clear();
        for (const pointer of pointersNext.values()) {
            const surface = frame.clientToSurface(
                pointer.clientX,
                pointer.clientY,
                wheelSurface,
            );
            const prev = pointersFramePrev.get(pointer.id);
            const x = surface.x;
            const y = surface.y;
            const dx = frame.changed ? 0 : prev ? x - prev.x : 0;
            const dy = frame.changed ? 0 : prev ? y - prev.y : 0;

            pointersFrame.set(pointer.id, {
                ...pointer,
                x,
                y,
                dx,
                dy,
                isPrimary: pointer.id === primaryIdFrame,
            });
        }

        btnDownFrame.clear();
        btnPressedFrame.clear();
        btnReleasedFrame.clear();

        if (primaryIdFrame !== undefined) {
            forEachButton(btnDownByPointerNext.get(primaryIdFrame), (button) =>
                btnDownFrame.add(button),
            );
            forEachButton(
                btnPressedByPointerNext.get(primaryIdFrame),
                (button) => btnPressedFrame.add(button),
            );
            forEachButton(
                btnReleasedByPointerNext.get(primaryIdFrame),
                (button) => btnReleasedFrame.add(button),
            );
        }
        forEachButton(btnReleasedForcedNext, (button) =>
            btnReleasedFrame.add(button),
        );

        frame.clientToSurface(0, 0, wheelOrigin);
        frame.clientToSurface(wheelXNext, wheelYNext, wheelSurface);
        wheelXFrame = wheelSurface.x - wheelOrigin.x;
        wheelYFrame = wheelSurface.y - wheelOrigin.y;
        btnPressedByPointerNext.clear();
        btnReleasedByPointerNext.clear();
        btnReleasedForcedNext.clear();
        wheelXNext = 0;
        wheelYNext = 0;
    }

    function count(): number {
        return pointersFrame.size;
    }

    function has(id: PointerId): boolean {
        return pointersFrame.has(id);
    }

    function get(id: PointerId, out: PointerSnapshot): boolean {
        const pointer = pointersFrame.get(id);
        if (!pointer) return false;

        copyPointer(pointer, out);
        return true;
    }

    function forEach(
        out: PointerSnapshot,
        fn: (pointer: Readonly<PointerSnapshot>) => void,
    ): void {
        for (const pointer of pointersFrame.values()) {
            copyPointer(pointer, out);
            fn(out);
        }
    }

    return Object.freeze({
        attach,
        detach,
        latch,
        primary,
        wheelX,
        wheelY,
        btnDown,
        btnPressed,
        btnReleased,
        count,
        has,
        get,
        forEach,
    });
}
