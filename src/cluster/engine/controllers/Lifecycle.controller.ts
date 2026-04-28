export type LifecyclePhase = "stopped" | "running" | "paused" | "disposed";
export type LifecycleLivePhase = Exclude<LifecyclePhase, "disposed">;
export type LifecycleActivePhase = "running" | "paused";

type MaybePromise<T> = T | Promise<T>;

export type Lifecycle = Readonly<{
    start(): Promise<boolean>;
    resume(): Promise<boolean>;
    pause(): Promise<boolean>;
    stop(): Promise<boolean>;
    dispose(): Promise<boolean>;

    phase(): LifecyclePhase;
    isStopped(): boolean;
    isRunning(): boolean;
    isPaused(): boolean;
    isDisposed(): boolean;

    assertNotDisposed(): void;
}>;

export type LifecycleConfig = Readonly<{
    tag?: string;
    debug?: boolean;

    onStart?: () => MaybePromise<void>;
    onResume?: () => MaybePromise<void>;
    onPause?: () => MaybePromise<void>;
    onDispose?: (from: LifecycleLivePhase) => MaybePromise<void>;
    onStop?: (from: LifecycleActivePhase) => MaybePromise<void>;
}>;

export function createLifecycle(config: LifecycleConfig = {}): Lifecycle {
    const {
        tag = "Lifecycle",
        debug = false,
        onStart,
        onResume,
        onPause,
        onStop,
        onDispose,
    } = config;

    let currentPhase: LifecyclePhase = "stopped";

    function fail(message: string): never {
        throw new Error(`${tag}: ${message}`);
    }

    function ensureNotDisposed(): boolean {
        if (currentPhase !== "disposed") return true;
        if (debug) {
            fail("called after dispose()");
        }
        return false;
    }

    function assertNotDisposed(): void {
        if (!ensureNotDisposed()) return;
    }

    function phase(): LifecyclePhase {
        return currentPhase;
    }

    function isStopped(): boolean {
        return currentPhase === "stopped";
    }

    function isRunning(): boolean {
        return currentPhase === "running";
    }

    function isPaused(): boolean {
        return currentPhase === "paused";
    }

    function isDisposed(): boolean {
        return currentPhase === "disposed";
    }

    async function start(): Promise<boolean> {
        if (!ensureNotDisposed()) return false;
        if (currentPhase !== "stopped") return false;

        await onStart?.();
        currentPhase = "running";
        return true;
    }

    async function resume(): Promise<boolean> {
        if (!ensureNotDisposed()) return false;
        if (currentPhase !== "paused") return false;

        await onResume?.();
        currentPhase = "running";
        return true;
    }

    async function pause(): Promise<boolean> {
        if (!ensureNotDisposed()) return false;
        if (currentPhase !== "running") return false;

        await onPause?.();
        currentPhase = "paused";
        return true;
    }

    async function stop(): Promise<boolean> {
        if (!ensureNotDisposed()) return false;
        if (currentPhase !== "running" && currentPhase !== "paused") {
            return false;
        }

        const from = currentPhase;
        await onStop?.(from);
        currentPhase = "stopped";
        return true;
    }

    async function dispose(): Promise<boolean> {
        if (currentPhase === "disposed") return false;

        const from = currentPhase;
        const errors: unknown[] = [];

        // Best-effort shutdown: always attempt all teardown paths.
        if (currentPhase === "running" || currentPhase === "paused") {
            try {
                await onStop?.(currentPhase);
            } catch (error) {
                errors.push(error);
            }
        }

        try {
            await onDispose?.(from);
        } catch (error) {
            errors.push(error);
        }

        currentPhase = "disposed";

        if (errors.length === 1) {
            throw errors[0];
        }

        if (errors.length > 1) {
            throw new AggregateError(errors, `${tag}: dispose() failed`);
        }

        return true;
    }

    return {
        start,
        resume,
        pause,
        stop,
        dispose,
        phase,
        isStopped,
        isRunning,
        isPaused,
        isDisposed,
        assertNotDisposed,
    };
}
