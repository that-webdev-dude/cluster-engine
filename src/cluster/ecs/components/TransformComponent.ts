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
  position: Vector;
  anchor: Vector;
  scale: Vector;
  pivot: Vector;
  angle: number;

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
    this.angle = angle;
  }
}
