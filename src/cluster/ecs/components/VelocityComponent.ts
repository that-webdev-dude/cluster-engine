import { Component } from "../../core/Component";
import { Vector } from "../../tools/Vector";

// Interface for component properties
export interface Options {
  velocity?: Vector;
  minSpeed?: number;
  maxSpeed?: number;
}

// Velocity Component
export class VelocityComponent implements Component {
  private _velocity: Vector;
  private _maxSpeed: number | undefined;
  private _minSpeed: number | undefined;

  constructor({
    velocity = new Vector(0, 0),
    minSpeed = undefined,
    maxSpeed = undefined,
  }: Options = {}) {
    this._velocity = velocity;
    this._minSpeed = minSpeed;
    this._maxSpeed = maxSpeed;
  }

  get x(): number {
    return this.velocity.x;
  }

  set x(value: number) {
    this.velocity.x = value;
  }

  get y(): number {
    return this.velocity.y;
  }

  set y(value: number) {
    this.velocity.y = value;
  }

  get velocity(): Vector {
    return this._velocity;
  }

  set velocity(value: Vector) {
    this._velocity = value;
  }

  get minSpeed(): number | undefined {
    return this._minSpeed;
  }

  set minSpeed(value: number) {
    if (value < 0) {
      throw new TypeError(
        "[VelocityComponent setter]: minSpeed must be a positive number"
      );
    }
    if (this._maxSpeed !== undefined && value > this._maxSpeed) {
      throw new TypeError(
        "[VelocityComponent setter]: minSpeed must be less than maxSpeed"
      );
    }
    this._minSpeed = value;
  }

  get maxSpeed(): number | undefined {
    return this._maxSpeed;
  }

  set maxSpeed(value: number) {
    if (value < 0) {
      throw new TypeError(
        "[VelocityComponent setter]: maxSpeed must be a positive number"
      );
    }
    if (this._minSpeed !== undefined && value < this._minSpeed) {
      throw new TypeError(
        "[VelocityComponent setter]: maxSpeed must be greater than minSpeed"
      );
    }
    this._maxSpeed = value;
  }

  get direction(): Vector {
    return this.velocity.normalize();
  }
}
