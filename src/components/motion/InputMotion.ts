import { Component } from "../../cluster";
import { Vector } from "../../cluster";

// Component errors
enum ComponentErrors {}

// Interface for component properties
export interface ComponentOptions {
  speedX: number;
  speedY: number;
}

// Transform Component
export class InputMotion implements Component {
  public speedX: number;
  public speedY: number;

  constructor({ speedX = 0, speedY = 0 }: ComponentOptions) {
    this.speedX = speedX;
    this.speedY = speedY;
  }
}
