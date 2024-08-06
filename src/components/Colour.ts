import { Component } from "../cluster";

// Component errors
enum ComponentErrors {}

// Interface for component properties
export interface ComponentOptions {
  fill?: string;
  stroke?: string;
}

// Transform Component
export class Colour implements Component {
  readonly type = "Colour";
  public fill: string;
  public stroke: string;

  constructor({
    fill = "black",
    stroke = "transparent",
  }: ComponentOptions = {}) {
    this.fill = fill;
    this.stroke = stroke;
  }
}
