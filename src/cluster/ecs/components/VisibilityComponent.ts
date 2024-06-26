import { Component } from "../../core/Component";

// Interface for component properties
export interface VisibilityOptions {
  opacity?: number;
}

// Visibility Component
export class VisibilityComponent implements Component {
  private _opacity: number;

  constructor({ opacity = 1 }: VisibilityOptions = {}) {
    if (opacity < 0 || opacity > 1) {
      throw new TypeError(
        "[VisibilityComponent constructor]: Opacity must be between 0 and 1"
      );
    }
    this._opacity = opacity;
  }

  get opacity(): number {
    return this._opacity;
  }

  set opacity(value: number) {
    if (value < 0 || value > 1) {
      throw new TypeError(
        "[VisibilityComponent setter]: Opacity must be between 0 and 1"
      );
    }
    this._opacity = value;
  }

  get visible(): boolean {
    return this._opacity > 0;
  }
}
