import type { Rect } from "../../../types/geometry";

export type DisplaySnapshotLike = {
    w: number;
    h: number;
    dpr: number;
    rev: number;
    changed: boolean;
    cssW?: number | undefined;
    cssH?: number | undefined;
    rect?: Rect | undefined;
    isFullscreen?: boolean | undefined;
};

export type DisplaySnapshotDiffModule = Readonly<{
    apply(prev: DisplaySnapshotLike, next: DisplaySnapshotLike): void;
}>;

export function createDisplaySnapshotDiff(): DisplaySnapshotDiffModule {
    const rectEqual = (a?: Rect, b?: Rect): boolean => {
        if (!a && !b) return true;
        if (!a || !b) return false;

        return (
            a.left === b.left &&
            a.top === b.top &&
            a.width === b.width &&
            a.height === b.height
        );
    };

    function apply(prev: DisplaySnapshotLike, next: DisplaySnapshotLike) {
        const changed =
            prev.w !== next.w ||
            prev.h !== next.h ||
            prev.dpr !== next.dpr ||
            prev.cssW !== next.cssW ||
            prev.cssH !== next.cssH ||
            !rectEqual(prev.rect, next.rect) ||
            prev.isFullscreen !== next.isFullscreen;

        if (changed) {
            next.rev++;
        }

        next.changed = changed;
    }

    return Object.freeze({ apply });
}
