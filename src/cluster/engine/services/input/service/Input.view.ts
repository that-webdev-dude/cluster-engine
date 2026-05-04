import type {
    InputSnapshot,
    InputView,
    KeyCode,
    MouseButton,
    PointerId,
    PointerSnapshot,
} from "./Input.types";

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

export function createInputView(getSnapshot: () => InputSnapshot): InputView {
    const keyboard = Object.freeze({
        down(code: KeyCode): boolean {
            return getSnapshot().keyboard.down.has(code);
        },
        pressed(code: KeyCode): boolean {
            return getSnapshot().keyboard.pressed.has(code);
        },
        released(code: KeyCode): boolean {
            return getSnapshot().keyboard.released.has(code);
        },
    });

    const buttons = Object.freeze({
        down(button: MouseButton): boolean {
            return getSnapshot().pointer.buttons.down.has(button);
        },
        pressed(button: MouseButton): boolean {
            return getSnapshot().pointer.buttons.pressed.has(button);
        },
        released(button: MouseButton): boolean {
            return getSnapshot().pointer.buttons.released.has(button);
        },
    });

    const pointers = Object.freeze({
        get count() {
            return getSnapshot().pointer.pointers.size;
        },
        get primaryId() {
            return getSnapshot().pointer.primaryId;
        },
        has(id: PointerId): boolean {
            return getSnapshot().pointer.pointers.has(id);
        },
        get(id: PointerId, out: PointerSnapshot): boolean {
            const pointer = getSnapshot().pointer.pointers.get(id);
            if (!pointer) return false;

            copyPointer(pointer, out);
            return true;
        },
        forEach(
            out: PointerSnapshot,
            fn: (pointer: Readonly<PointerSnapshot>) => void,
        ): void {
            for (const pointer of getSnapshot().pointer.pointers.values()) {
                copyPointer(pointer, out);
                fn(out);
            }
        },
    });

    const pointer = Object.freeze({
        get x() {
            return getSnapshot().pointer.x;
        },
        get y() {
            return getSnapshot().pointer.y;
        },
        get dx() {
            return getSnapshot().pointer.dx;
        },
        get dy() {
            return getSnapshot().pointer.dy;
        },
        get clientX() {
            return getSnapshot().pointer.clientX;
        },
        get clientY() {
            return getSnapshot().pointer.clientY;
        },
        get wheelX() {
            return getSnapshot().pointer.wheelX;
        },
        get wheelY() {
            return getSnapshot().pointer.wheelY;
        },
        buttons,
        pointers,
    });

    return Object.freeze({
        keyboard,
        pointer,
    });
}
