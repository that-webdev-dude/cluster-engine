import { Component } from "../../core/Component";

// Interface for component properties
export interface RadiusOptions {
  radius?: number;
}

// Radius Component
export class RadiusComponent implements Component {
  private _radius: number;

  constructor({ radius = 0 }: RadiusOptions = {}) {
    if (radius < 0) {
      throw new TypeError(
        "[RadiusComponent constructor]: radius must be a positive number"
      );
    }
    this._radius = radius;
  }

  get value(): number {
    return this._radius;
  }

  set value(value: number) {
    if (value < 0) {
      throw new TypeError(
        "[RadiusComponent setter]: value must be a positive number"
      );
    }
    this._radius = value;
  }

  get radius(): number {
    return this._radius;
  }

  set radius(radius: number) {
    if (radius < 0) {
      throw new TypeError(
        "[RadiusComponent setter]: radius must be a positive number"
      );
    }
    this._radius = radius;
  }
}
