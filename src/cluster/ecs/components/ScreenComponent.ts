import { Component } from "../../core/Component";

type OffscreenBehavior =
  | "contain"
  | "wrap"
  | "die"
  | "stop"
  | "bounce"
  | "none";

// Interface for component properties
export interface ScreenOptions {
  width: number;
  height: number;
  offscreenBehavior?: OffscreenBehavior;
}

// Screen Component
export class ScreenComponent implements Component {
  width: number;
  height: number;
  offscreenBehavior: OffscreenBehavior;

  constructor({ width, height, offscreenBehavior = "contain" }: ScreenOptions) {
    this.width = width;
    this.height = height;
    this.offscreenBehavior = offscreenBehavior;
  }
}
