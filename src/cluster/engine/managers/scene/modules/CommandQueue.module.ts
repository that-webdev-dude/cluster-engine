import type { Scene } from "../Scene.types";

type SceneCommand<P, C, R> = {
    type: "set" | "push" | "pop";
    scene?: Scene<P, C, R>;
};

export type SceneCommandQueueModule<P, C, R> = {
    set(scene: Scene<P, C, R>): void;
    push(scene: Scene<P, C, R>): void;
    pop(): void;
    flush(on: {
        set: (scene: Scene<P, C, R>) => void;
        push: (scene: Scene<P, C, R>) => void;
        pop: () => void;
    }): void;
    clear(): void;
};

export function createSceneCommandQueueModule<
    P,
    C,
    R,
>(): SceneCommandQueueModule<P, C, R> {
    const queue: SceneCommand<P, C, R>[] = [];

    function set(scene: Scene<P, C, R>) {
        queue.push({ type: "set", scene });
    }

    function push(scene: Scene<P, C, R>) {
        queue.push({ type: "push", scene });
    }

    function pop() {
        queue.push({ type: "pop" });
    }

    function flush(on: {
        set: (scene: Scene<P, C, R>) => void;
        push: (scene: Scene<P, C, R>) => void;
        pop: () => void;
    }) {
        const pending = queue.splice(0); // wow
        for (const cmd of pending) {
            switch (cmd.type) {
                case "set":
                    if (cmd.scene) on.set(cmd.scene);
                    break;
                case "push":
                    if (cmd.scene) on.push(cmd.scene);
                    break;
                case "pop":
                    on.pop();
                    break;
            }
        }
    }

    function clear() {
        queue.length = 0;
    }

    return {
        set,
        push,
        pop,
        flush,
        clear,
    };
}
