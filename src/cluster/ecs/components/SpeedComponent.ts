import { Component } from "../../core/Component";
import { Vector } from "../../tools/Vector";

// Interface for component properties
export interface SpeedOptions {
  speed?: Vector;
}

// Speed Component
export class SpeedComponent implements Component {
  speed: Vector;

  constructor({ speed = new Vector(0, 0) }: SpeedOptions = {}) {
    this.speed = speed;
  }

  get x(): number {
    return this.speed.x;
  }

  set x(value: number) {
    this.speed.x = value;
  }

  get y(): number {
    return this.speed.y;
  }

  set y(value: number) {
    this.speed.y = value;
  }
}
