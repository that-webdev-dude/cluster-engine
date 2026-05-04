import { describe, expect, it } from "vitest";
import { createInput } from "./Input.service";
import type { InputFrame, PointerSnapshot } from "./Input.types";

function createCanvas(width = 10, height = 20) {
    return { width, height } as HTMLCanvasElement;
}

function createFrame(scale = 1, changed = false): InputFrame {
    return {
        changed,
        clientToSurface(clientX, clientY, out) {
            const result = out ?? { x: 0, y: 0 };
            result.x = clientX * scale;
            result.y = clientY * scale;
            return result;
        },
    };
}

function keyEvent(type: string, code: string): Event {
    const event = new Event(type);
    Object.defineProperty(event, "code", { value: code });
    return event;
}

function pointerEvent(
    type: string,
    init: {
        pointerId?: number;
        pointerType?: "mouse" | "pen" | "touch";
        isPrimary?: boolean;
        clientX?: number;
        clientY?: number;
        buttons?: number;
    },
): Event {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, {
        pointerId: init.pointerId ?? 1,
        pointerType: init.pointerType ?? "mouse",
        isPrimary: init.isPrimary ?? true,
        clientX: init.clientX ?? 0,
        clientY: init.clientY ?? 0,
        buttons: init.buttons ?? 0,
        pressure: 0,
        tiltX: 0,
        tiltY: 0,
        twist: 0,
    });
    return event;
}

function wheelEvent(deltaX: number, deltaY: number): Event {
    const event = new Event("wheel", { cancelable: true });
    Object.assign(event, { deltaX, deltaY });
    return event;
}

describe("createInput", () => {
    it("publishes keyboard down, pressed, and released on latch", async () => {
        const keyboardTarget = new EventTarget();
        const input = createInput({
            canvas: createCanvas(),
            options: { targets: { keyboard: keyboardTarget } },
        });

        await input.start();

        keyboardTarget.dispatchEvent(keyEvent("keydown", "KeyA"));

        expect(input.view.keyboard.down("KeyA")).toBe(false);
        expect(input.view.keyboard.pressed("KeyA")).toBe(false);

        input.latch(createFrame());

        expect(input.view.keyboard.down("KeyA")).toBe(true);
        expect(input.view.keyboard.pressed("KeyA")).toBe(true);

        input.latch(createFrame());

        expect(input.view.keyboard.down("KeyA")).toBe(true);
        expect(input.view.keyboard.pressed("KeyA")).toBe(false);

        keyboardTarget.dispatchEvent(keyEvent("keyup", "KeyA"));
        input.latch(createFrame());

        expect(input.view.keyboard.down("KeyA")).toBe(false);
        expect(input.view.keyboard.released("KeyA")).toBe(true);

        await input.dispose();
    });

    it("publishes pointer coordinates in surface space", async () => {
        const pointerTarget = new EventTarget();
        const input = createInput({
            canvas: createCanvas(),
            options: { targets: { pointer: pointerTarget } },
        });
        const pointerOut: PointerSnapshot = {
            id: 0,
            type: "mouse",
            isPrimary: false,
            x: 0,
            y: 0,
            dx: 0,
            dy: 0,
            buttons: 0,
        };

        await input.start();

        pointerTarget.dispatchEvent(
            pointerEvent("pointerdown", {
                clientX: 5,
                clientY: 7,
                buttons: 1,
            }),
        );
        input.latch(createFrame(2));

        expect(input.view.pointer.x).toBe(10);
        expect(input.view.pointer.y).toBe(14);
        expect(input.view.pointer.buttons.down(0)).toBe(true);
        expect(input.view.pointer.buttons.pressed(0)).toBe(true);
        expect(input.view.pointer.pointers.get(1, pointerOut)).toBe(true);
        expect(pointerOut.x).toBe(10);
        expect(pointerOut.y).toBe(14);

        await input.dispose();
    });

    it("resets pointer delta when the display frame changed", async () => {
        const pointerTarget = new EventTarget();
        const input = createInput({
            canvas: createCanvas(),
            options: { targets: { pointer: pointerTarget } },
        });

        await input.start();

        pointerTarget.dispatchEvent(
            pointerEvent("pointermove", { clientX: 5, clientY: 5 }),
        );
        input.latch(createFrame(1));

        pointerTarget.dispatchEvent(
            pointerEvent("pointermove", { clientX: 8, clientY: 9 }),
        );
        input.latch(createFrame(1, true));

        expect(input.view.pointer.x).toBe(8);
        expect(input.view.pointer.y).toBe(9);
        expect(input.view.pointer.dx).toBe(0);
        expect(input.view.pointer.dy).toBe(0);

        pointerTarget.dispatchEvent(
            pointerEvent("pointermove", { clientX: 10, clientY: 11 }),
        );
        input.latch(createFrame(1));

        expect(input.view.pointer.dx).toBe(2);
        expect(input.view.pointer.dy).toBe(2);

        await input.dispose();
    });

    it("publishes wheel deltas for one latched frame", async () => {
        const wheelTarget = new EventTarget();
        const input = createInput({
            canvas: createCanvas(),
            options: { targets: { wheel: wheelTarget } },
        });

        await input.start();

        wheelTarget.dispatchEvent(wheelEvent(3, 4));
        input.latch(createFrame(2));

        expect(input.view.pointer.wheelX).toBe(6);
        expect(input.view.pointer.wheelY).toBe(8);

        input.latch(createFrame(2));

        expect(input.view.pointer.wheelX).toBe(0);
        expect(input.view.pointer.wheelY).toBe(0);

        await input.dispose();
    });

    it("clears published state and detaches listeners on stop", async () => {
        const keyboardTarget = new EventTarget();
        const input = createInput({
            canvas: createCanvas(),
            options: { targets: { keyboard: keyboardTarget } },
        });

        await input.start();
        keyboardTarget.dispatchEvent(keyEvent("keydown", "KeyA"));
        input.latch(createFrame());

        expect(input.view.keyboard.down("KeyA")).toBe(true);

        await input.stop();
        keyboardTarget.dispatchEvent(keyEvent("keydown", "KeyB"));
        input.latch(createFrame());

        expect(input.view.keyboard.down("KeyA")).toBe(false);
        expect(input.view.keyboard.down("KeyB")).toBe(false);
    });

    it("guards debug calls after dispose", async () => {
        const input = createInput({
            canvas: createCanvas(),
            debug: true,
        });

        await input.start();
        await input.dispose();

        expect(() => input.latch(createFrame())).toThrow(
            "InputService: called after dispose()",
        );
    });
});
