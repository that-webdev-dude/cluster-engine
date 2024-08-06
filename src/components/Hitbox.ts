import { Component } from "../cluster";
import { Vector } from "../cluster";

// Component errors
enum ComponentErrors {
  RangeError = "[Hitbox]: width & height must be greater than 0",
}

// Interface for component properties
export interface ComponentOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  anchor?: Vector;
}

// Transform Component
export class Hitbox implements Component {
  readonly type = "Hitbox";
  _x: number;
  _y: number;
  _width: number;
  _height: number;
  anchor: Vector;

  constructor({ x, y, width, height, anchor }: ComponentOptions) {
    if (width <= 0 || height <= 0)
      throw new RangeError(ComponentErrors.RangeError);

    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    this.anchor = anchor || new Vector(0, 0);
  }

  get x() {
    return this._x + this.anchor.x;
  }

  get y() {
    return this._y + this.anchor.y;
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }
}
