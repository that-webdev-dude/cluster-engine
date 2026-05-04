import type { Vec2 } from "../../../types/geometry";
import type { EnginePlatform } from "../../../types/patform";

export type KeyCode = string;

export type MouseButton = 0 | 1 | 2 | 3 | 4;

export type PointerId = number;

export type PointerType = "mouse" | "pen" | "touch";

export type ButtonsMask = number;

export type PointerSnapshot = {
    id: PointerId;
    type: PointerType;
    isPrimary: boolean;
    x: number;
    y: number;
    dx: number;
    dy: number;
    clientX?: number;
    clientY?: number;
    buttons: ButtonsMask;
    pressure?: number;
    tiltX?: number;
    tiltY?: number;
    twist?: number;
};

export type Pointers = Readonly<{
    count: number;
    primaryId?: PointerId;
    has(id: PointerId): boolean;
    get(id: PointerId, out: PointerSnapshot): boolean;
    forEach(
        out: PointerSnapshot,
        fn: (pointer: Readonly<PointerSnapshot>) => void,
    ): void;
}>;

export type PointerCapturePolicy = "auto" | "none" | "manual";

export type ContextMenuPolicy = "suppressOnCanvas" | "allow";

export type InputTargets = Readonly<{
    keyboard?: EventTarget;
    pointer?: EventTarget;
    wheel?: EventTarget;
}>;

export type InputOptions = Readonly<{
    targets?: InputTargets;
    capture?: PointerCapturePolicy;
    contextMenu?: ContextMenuPolicy;
    wheelPreventDefault?: boolean;
    touchPreventDefault?: boolean;
    ignoreKeyboardWhenTyping?: boolean;
}>;

export type InputPlatform = Pick<EnginePlatform, "window" | "document">;

export type InputFrame = Readonly<{
    changed: boolean;
    clientToSurface(clientX: number, clientY: number, out?: Vec2): Vec2;
}>;

export type InputKeyboardView = Readonly<{
    down(code: KeyCode): boolean;
    pressed(code: KeyCode): boolean;
    released(code: KeyCode): boolean;
}>;

export type InputPointerButtonsView = Readonly<{
    down(button: MouseButton): boolean;
    pressed(button: MouseButton): boolean;
    released(button: MouseButton): boolean;
}>;

export type InputPointerView = Readonly<{
    x: number;
    y: number;
    dx: number;
    dy: number;
    clientX?: number;
    clientY?: number;
    wheelX: number;
    wheelY: number;
    buttons: InputPointerButtonsView;
    pointers: Pointers;
}>;

export type InputView = Readonly<{
    keyboard: InputKeyboardView;
    pointer: InputPointerView;
}>;

export type InputConfig = Readonly<{
    canvas: HTMLCanvasElement | OffscreenCanvas;
    options?: InputOptions;
    platform?: InputPlatform;
    debug?: boolean;
}>;

export type InputKeyboardSnapshot = {
    down: Set<KeyCode>;
    pressed: Set<KeyCode>;
    released: Set<KeyCode>;
};

export type InputPointerButtonSnapshot = {
    down: Set<MouseButton>;
    pressed: Set<MouseButton>;
    released: Set<MouseButton>;
};

export type InputPointerStateSnapshot = {
    x: number;
    y: number;
    dx: number;
    dy: number;
    clientX?: number;
    clientY?: number;
    wheelX: number;
    wheelY: number;
    primaryId?: PointerId;
    buttons: InputPointerButtonSnapshot;
    pointers: Map<PointerId, PointerSnapshot>;
};

export type InputSnapshot = {
    keyboard: InputKeyboardSnapshot;
    pointer: InputPointerStateSnapshot;
};
