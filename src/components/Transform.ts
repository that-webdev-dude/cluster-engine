import { Component } from "../cluster";
import { Vector } from "../cluster";

// Component errors
enum TransformErrors {
  AngleRange = "[Transform]: Angle must be between 0 and 360",
}

// Interface for component properties
export interface TransformOptions {
  position?: Vector;
  anchor?: Vector;
  scale?: Vector;
  pivot?: Vector;
  angle?: number;
}

// Transform Component
export class Transform implements Component {
  readonly type = "Transform";
  public position: Vector;
  public anchor: Vector;
  public scale: Vector;
  public pivot: Vector;
  private _angle: number;

  constructor({
    position = new Vector(0, 0),
    anchor = new Vector(0, 0),
    scale = new Vector(1, 1),
    pivot = new Vector(0, 0),
    angle = 0,
  }: TransformOptions = {}) {
    if (angle < 0 || angle > 360)
      throw new TypeError(TransformErrors.AngleRange);

    this.position = Vector.from(position);
    this.anchor = Vector.from(anchor);
    this.scale = Vector.from(scale);
    this.pivot = Vector.from(pivot);
    this._angle = angle;
  }

  get angle(): number {
    return this._angle;
  }

  set angle(angle: number) {
    if (angle < 0 || angle > 360)
      throw new TypeError(TransformErrors.AngleRange);

    this._angle = angle;
  }
}
