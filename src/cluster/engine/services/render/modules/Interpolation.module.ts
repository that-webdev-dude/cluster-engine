import type { RenderTransform2DInput } from "../service/Render.types";

export type RenderResolvedTransform2D = Readonly<{
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    radians: number;
    offsetX: number;
    offsetY: number;
    pivotX: number;
    pivotY: number;
}>;

function lerp(previous: number, current: number, alpha: number): number {
    return previous + (current - previous) * alpha;
}

export function resolveRenderTransform2D(
    transform: RenderTransform2DInput,
    alpha: number,
): RenderResolvedTransform2D {
    const scaleX = transform.scaleX ?? 1;
    const scaleY = transform.scaleY ?? 1;
    const radians = transform.radians ?? 0;

    return {
        x: lerp(transform.prevX ?? transform.x, transform.x, alpha),
        y: lerp(transform.prevY ?? transform.y, transform.y, alpha),
        scaleX: lerp(transform.prevScaleX ?? scaleX, scaleX, alpha),
        scaleY: lerp(transform.prevScaleY ?? scaleY, scaleY, alpha),
        radians: lerp(transform.prevRadians ?? radians, radians, alpha),
        offsetX: transform.offsetX ?? 0,
        offsetY: transform.offsetY ?? 0,
        pivotX: transform.pivotX ?? 0,
        pivotY: transform.pivotY ?? 0,
    };
}
