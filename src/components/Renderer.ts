import { Component } from "../cluster";
import { Vector } from "../cluster";

// Component errors
enum ComponentErrors {}

// Interface for component properties
export interface ComponentOptions {
  layer?: number;
}

// Transform Component
export class Renderer implements Component {
  layer: number;
  constructor({ layer = 0 }: ComponentOptions = {}) {
    this.layer = layer;
  }
}
