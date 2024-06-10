import { Component } from "../../core/Component";
import { Vector } from "../../tools/Vector";

// Interface for component properties
export interface SpeedOptions {
  speed?: Vector;
}

// Speed Component
export class SpeedComponent implements Component {
  private _speed: Vector;

  constructor({ speed = new Vector(0, 0) }: SpeedOptions = {}) {
    this._speed = speed;
  }

  get x(): number {
    return this._speed.x;
  }

  set x(value: number) {
    this._speed.x = value;
  }

  get y(): number {
    return this._speed.y;
  }

  set y(value: number) {
    this._speed.y = value;
  }
}
