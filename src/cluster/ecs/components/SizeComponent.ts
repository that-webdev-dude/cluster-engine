import { Component } from "../../core/Component";

// Interface for component properties
export interface SizeOptions {
  width?: number;
  height?: number;
}

// Size Component
export class SizeComponent implements Component {
  width: number;
  height: number;

  constructor({ width = 32, height = 32 }: SizeOptions = {}) {
    if (width <= 0 || height <= 0) {
      throw new Error(
        "[SizeComponent constructor]: Width and Height must be positive numbers."
      );
    }

    this.width = width;
    this.height = height;
  }
}
