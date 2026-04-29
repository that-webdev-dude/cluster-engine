import type { Scene } from "../Scene.types";

type SceneCommand<C, R> = {
    type: "set" | "push" | "pop";
    scene?: Scene<C, R>;
};

export type SceneCommandQueueModule<C, R> = {
    set(scene: Scene<C, R>): void;
    push(scene: Scene<C, R>): void;
    pop(): void;
    flush(on: {
        set: (scene: Scene<C, R>) => void;
        push: (scene: Scene<C, R>) => void;
        pop: () => void;
    }): void;
    clear(): void;
};

export function createSceneCommandQueueModule<C, R>(): SceneCommandQueueModule<
    C,
    R
> {
    const queue: SceneCommand<C, R>[] = [];

    function set(scene: Scene<C, R>) {
        queue.push({ type: "set", scene });
    }

    function push(scene: Scene<C, R>) {
        queue.push({ type: "push", scene });
    }

    function pop() {
        queue.push({ type: "pop" });
    }

    function flush(on: {
        set: (scene: Scene<C, R>) => void;
        push: (scene: Scene<C, R>) => void;
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
