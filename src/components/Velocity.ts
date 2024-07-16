import { Component } from "../cluster";
import { Vector } from "../cluster";

// Component errors
enum ComponentErrors {}

// Interface for component properties
export interface ComponentOptions {
  value: Vector;
  minSpeed?: number;
  maxSpeed?: number;
}

// Transform Component
export class Velocity implements Component {
  value: Vector;
  minSpeed: number;
  maxSpeed: number;

  constructor({ value, minSpeed = 0, maxSpeed = 0 }: ComponentOptions) {
    this.value = value;
    this.minSpeed = minSpeed;
    this.maxSpeed = maxSpeed;
  }
}
