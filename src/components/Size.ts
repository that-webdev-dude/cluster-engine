import { Component } from "../cluster";

// Component errors
enum ComponentErrors {
  rangeError = "[Size]: Dimension must be greater than 0",
}

// Interface for component properties
export interface ComponentOptions {
  width?: number;
  height?: number;
}

// Transform Component
export class Size implements Component {
  readonly type = "Size";
  private _width: number;
  private _height: number;

  constructor({ width = 32, height = 32 }: ComponentOptions = {}) {
    if (width <= 0 || height <= 0)
      throw new RangeError(ComponentErrors.rangeError);

    this._width = width;
    this._height = height;
  }

  get width(): number {
    return this._width;
  }

  set width(width: number) {
    if (width <= 0) throw new RangeError(ComponentErrors.rangeError);
    this._width = width;
  }

  get height(): number {
    return this._height;
  }

  set height(height: number) {
    if (height <= 0) throw new RangeError(ComponentErrors.rangeError);
    this._height = height;
  }
}
