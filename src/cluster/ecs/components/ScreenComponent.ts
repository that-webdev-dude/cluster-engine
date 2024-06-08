import { Component } from "../../core/Component";

// Interface for component properties
export interface ScreenOptions {
  width?: number;
  height?: number;
  entityWidth?: number;
  entityHeight?: number;
  offscreenBehavior?: "contain" | "wrap" | "die";
}

// Screen Component
export class ScreenComponent implements Component {
  width: number;
  height: number;
  entityWidth: number;
  entityHeight: number;
  offscreenBehavior: "contain" | "wrap" | "die";

  constructor({
    width = 800,
    height = 600,
    entityWidth = 32,
    entityHeight = 32,
    offscreenBehavior = "contain",
  }: ScreenOptions = {}) {
    this.width = width;
    this.height = height;
    this.entityWidth = entityWidth;
    this.entityHeight = entityHeight;
    this.offscreenBehavior = offscreenBehavior;
  }
}
