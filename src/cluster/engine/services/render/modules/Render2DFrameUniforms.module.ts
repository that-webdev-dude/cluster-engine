import type { Render2DPreparedFrame } from "./Render2DPrepare.module";
import type { RenderCameraInput } from "../service/Render.types";

export type Render2DFrameUniformValues = Readonly<{
    alpha: number;
    targetWidth: number;
    targetHeight: number;
    targetDpr: number;
    cameraX: number;
    cameraY: number;
    cameraZoom: number;
    cameraShakeX: number;
    cameraShakeY: number;
}>;

export const RENDER_2D_FRAME_UNIFORM_FLOAT_COUNT = 12;

export const DEFAULT_RENDER_CAMERA_INPUT: RenderCameraInput = Object.freeze({
    x: 0,
    y: 0,
    zoom: 1,
    shakeX: 0,
    shakeY: 0,
});

export function getRender2DFrameUniformValues(
    frame: Render2DPreparedFrame,
): Render2DFrameUniformValues {
    const camera = frame.camera ?? DEFAULT_RENDER_CAMERA_INPUT;

    return {
        alpha: frame.alpha,
        targetWidth: frame.target.w,
        targetHeight: frame.target.h,
        targetDpr: frame.target.dpr,
        cameraX: camera.x,
        cameraY: camera.y,
        cameraZoom: camera.zoom,
        cameraShakeX: camera.shakeX,
        cameraShakeY: camera.shakeY,
    };
}

export function writeRender2DFrameUniformData(
    data: Float32Array<ArrayBufferLike>,
    values: Render2DFrameUniformValues,
): Float32Array<ArrayBufferLike> {
    const output =
        data.length >= RENDER_2D_FRAME_UNIFORM_FLOAT_COUNT
            ? data
            : new Float32Array(RENDER_2D_FRAME_UNIFORM_FLOAT_COUNT);

    output[0] = values.alpha;
    output[1] = values.targetWidth;
    output[2] = values.targetHeight;
    output[3] = values.targetDpr;
    output[4] = values.cameraX;
    output[5] = values.cameraY;
    output[6] = values.cameraZoom;
    output[7] = values.cameraShakeX;
    output[8] = values.cameraShakeY;
    output[9] = 0;
    output[10] = 0;
    output[11] = 0;

    return output;
}
