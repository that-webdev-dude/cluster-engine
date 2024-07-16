import { Component } from "../cluster";
import { Vector } from "../cluster";

// Component errors
enum ComponentErrors {}

// Interface for component properties
export interface ComponentOptions {
  value: Vector;
}

// Transform Component
export class Velocity implements Component {
  value: Vector;

  constructor({ value }: ComponentOptions) {
    this.value = value;
  }
}
