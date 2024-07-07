import { Component } from "../../core/Component";

// Interface for component properties
export interface ScreenOptions {
  width: number;
  height: number;
  offscreenBehavior?: "contain" | "wrap" | "die" | "bounce" | "none";
}

// Screen Component
export class ScreenComponent implements Component {
  width: number;
  height: number;
  offscreenBehavior: "contain" | "wrap" | "die" | "bounce" | "none";

  constructor({ width, height, offscreenBehavior = "contain" }: ScreenOptions) {
    this.width = width;
    this.height = height;
    this.offscreenBehavior = offscreenBehavior;
  }
}
