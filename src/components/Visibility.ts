import { Component } from "../cluster";

// Component errors
enum ComponentErrors {
  InvalidOpacity = "[VisibilityComponent]: Opacity must be between 0 and 1",
}

// Interface for component properties
export interface ComponentOptions {
  opacity?: number;
}

// Visibility Component
export class Visibility implements Component {
  readonly type = "Visibility";
  private _opacity: number;

  constructor({ opacity = 1 }: ComponentOptions = {}) {
    if (opacity < 0 || opacity > 1) {
      throw new TypeError(ComponentErrors.InvalidOpacity);
    }
    this._opacity = opacity;
  }

  get opacity(): number {
    return this._opacity;
  }

  set opacity(value: number) {
    if (value < 0 || value > 1) {
      throw new TypeError(ComponentErrors.InvalidOpacity);
    }
    this._opacity = value;
  }

  get visible(): boolean {
    return this._opacity > 0;
  }
}
