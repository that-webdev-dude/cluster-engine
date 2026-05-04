import {
    createLifecycle,
    type LifecycleActivePhase,
    type LifecycleLivePhase,
} from "../../../controllers/Lifecycle.controller";
import { createKeyboardStateModule } from "../modules/KeyboardState.module";
import { createPointerStateModule } from "../modules/PointerState.module";
import { createInputView } from "./Input.view";
import type {
    InputConfig,
    InputFrame,
    InputSnapshot,
    InputView,
    KeyCode,
    MouseButton,
    PointerId,
    PointerSnapshot,
} from "./Input.types";

const POINTER_BUTTONS: readonly MouseButton[] = [0, 1, 2, 3, 4];

export type InputService = Readonly<{
    view: InputView;
    start(): Promise<boolean>;
    stop(): Promise<boolean>;
    latch(frame: InputFrame): void;
    dispose(): Promise<boolean>;
}>;

function createEmptyPointerSnapshot(): PointerSnapshot {
    return {
        id: 0,
        type: "mouse",
        isPrimary: false,
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
        buttons: 0,
    };
}

function copyPointer(source: PointerSnapshot): PointerSnapshot {
    return {
        id: source.id,
        type: source.type,
        isPrimary: source.isPrimary,
        x: source.x,
        y: source.y,
        dx: source.dx,
        dy: source.dy,
        clientX: source.clientX,
        clientY: source.clientY,
        buttons: source.buttons,
        pressure: source.pressure,
        tiltX: source.tiltX,
        tiltY: source.tiltY,
        twist: source.twist,
    };
}

function createInputService(config: InputConfig): InputService {
    if (!config.canvas) throw new Error("InputService: canvas is required");

    const debug = config.debug ?? false;
    const env = {
        win:
            config.platform?.window ??
            (typeof window !== "undefined" ? window : undefined),
        doc:
            config.platform?.document ??
            (typeof document !== "undefined" ? document : undefined),
    };
    const pointerScratch = createEmptyPointerSnapshot();
    const snapshot: InputSnapshot = {
        keyboard: {
            down: new Set<KeyCode>(),
            pressed: new Set<KeyCode>(),
            released: new Set<KeyCode>(),
        },
        pointer: {
            x: 0,
            y: 0,
            dx: 0,
            dy: 0,
            clientX: undefined,
            clientY: undefined,
            wheelX: 0,
            wheelY: 0,
            primaryId: undefined,
            buttons: {
                down: new Set<MouseButton>(),
                pressed: new Set<MouseButton>(),
                released: new Set<MouseButton>(),
            },
            pointers: new Map<PointerId, PointerSnapshot>(),
        },
    };
    const keyboard = createKeyboardStateModule({
        keyboardTarget: config.options?.targets?.keyboard,
        window: env.win,
        document: env.doc,
        ignoreWhenTyping: config.options?.ignoreKeyboardWhenTyping,
    });
    const pointer = createPointerStateModule({
        canvas: config.canvas,
        window: env.win,
        document: env.doc,
        pointerTarget: config.options?.targets?.pointer,
        wheelTarget: config.options?.targets?.wheel,
        capturePolicy: config.options?.capture,
        contextMenuPolicy: config.options?.contextMenu,
        wheelPreventDefault: config.options?.wheelPreventDefault,
        touchPreventDefault: config.options?.touchPreventDefault,
    });

    const clearPublishedSnapshot = () => {
        snapshot.keyboard.down.clear();
        snapshot.keyboard.pressed.clear();
        snapshot.keyboard.released.clear();
        snapshot.pointer.x = 0;
        snapshot.pointer.y = 0;
        snapshot.pointer.dx = 0;
        snapshot.pointer.dy = 0;
        snapshot.pointer.clientX = undefined;
        snapshot.pointer.clientY = undefined;
        snapshot.pointer.wheelX = 0;
        snapshot.pointer.wheelY = 0;
        snapshot.pointer.primaryId = undefined;
        snapshot.pointer.buttons.down.clear();
        snapshot.pointer.buttons.pressed.clear();
        snapshot.pointer.buttons.released.clear();
        snapshot.pointer.pointers.clear();
    };

    const publishKeyboardSnapshot = () => {
        snapshot.keyboard.down.clear();
        snapshot.keyboard.pressed.clear();
        snapshot.keyboard.released.clear();
        keyboard.forEachDown((code) => snapshot.keyboard.down.add(code));
        keyboard.forEachPressed((code) => snapshot.keyboard.pressed.add(code));
        keyboard.forEachReleased((code) =>
            snapshot.keyboard.released.add(code),
        );
    };

    const publishPointerSnapshot = () => {
        const primary = pointer.primary();
        if (primary) {
            snapshot.pointer.x = primary.x;
            snapshot.pointer.y = primary.y;
            snapshot.pointer.dx = primary.dx;
            snapshot.pointer.dy = primary.dy;
            snapshot.pointer.clientX = primary.clientX;
            snapshot.pointer.clientY = primary.clientY;
            snapshot.pointer.primaryId = primary.id;
        } else {
            snapshot.pointer.x = 0;
            snapshot.pointer.y = 0;
            snapshot.pointer.dx = 0;
            snapshot.pointer.dy = 0;
            snapshot.pointer.clientX = undefined;
            snapshot.pointer.clientY = undefined;
            snapshot.pointer.primaryId = undefined;
        }

        snapshot.pointer.wheelX = pointer.wheelX();
        snapshot.pointer.wheelY = pointer.wheelY();
        snapshot.pointer.buttons.down.clear();
        snapshot.pointer.buttons.pressed.clear();
        snapshot.pointer.buttons.released.clear();

        for (const button of POINTER_BUTTONS) {
            if (pointer.btnDown(button)) {
                snapshot.pointer.buttons.down.add(button);
            }
            if (pointer.btnPressed(button)) {
                snapshot.pointer.buttons.pressed.add(button);
            }
            if (pointer.btnReleased(button)) {
                snapshot.pointer.buttons.released.add(button);
            }
        }

        snapshot.pointer.pointers.clear();
        pointer.forEach(pointerScratch, (current) => {
            snapshot.pointer.pointers.set(current.id, copyPointer(current));
        });
    };

    const handleStart = () => {
        keyboard.attach();
        pointer.attach();
        clearPublishedSnapshot();
    };

    const handleStop = (_from: LifecycleActivePhase) => {
        keyboard.detach();
        pointer.detach();
        clearPublishedSnapshot();
    };

    const handleDispose = (_from: LifecycleLivePhase) => {
        keyboard.detach();
        pointer.detach();
        clearPublishedSnapshot();
    };

    const lifecycle = createLifecycle({
        tag: "InputService",
        debug,
        onStart: handleStart,
        onStop: handleStop,
        onDispose: handleDispose,
    });

    function latch(frame: InputFrame): void {
        lifecycle.assertNotDisposed();
        if (!lifecycle.isRunning()) return;

        keyboard.latch();
        pointer.latch(frame);
        publishKeyboardSnapshot();
        publishPointerSnapshot();
    }

    return Object.freeze({
        view: createInputView(() => snapshot),
        start: lifecycle.start,
        stop: lifecycle.stop,
        latch,
        dispose: lifecycle.dispose,
    });
}

export function createInput(config: InputConfig): InputService {
    return createInputService(config);
}
