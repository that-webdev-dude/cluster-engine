import { Component } from "../../core/Component";
import { Vector } from "../../tools/Vector";

// Interface for component properties
export interface TransformOptions {
  position?: Vector;
  anchor?: Vector;
  scale?: Vector;
  pivot?: Vector;
  angle?: number;
}

// Transform Component
export class TransformComponent implements Component {
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
    if (angle < 0 || angle > 360) {
      throw new TypeError(
        "[TransformComponent constructor]: Angle must be between 0 and 360"
      );
    }

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
    if (angle < 0 || angle > 360) {
      throw new TypeError(
        "[TransformComponent setter]: Angle must be between 0 and 360"
      );
    }
    this._angle = angle;
  }
}
