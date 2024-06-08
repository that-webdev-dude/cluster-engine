import { Component } from "../../core/Component";

// Interface for component properties
export interface SpeedOptions {
  speed?: number;
}

// Speed Component
export class SpeedComponent implements Component {
  private _value: number;

  constructor({ speed = 0 }: SpeedOptions = {}) {
    if (speed < 0) {
      throw new TypeError(
        "[SpeedComponent constructor]: speed must be a positive number"
      );
    }
    this._value = speed;
  }

  get value(): number {
    return this._value;
  }

  set value(value: number) {
    if (value < 0) {
      throw new TypeError(
        "[SpeedComponent setter]: value must be a positive number"
      );
    }
    this._value = value;
  }
}
