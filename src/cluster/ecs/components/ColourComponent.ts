import { Component } from "../../core/Component";

// Interface for component properties
export interface ColourOptions {
  fill?: string;
  stroke?: string;
}

// Colour Component
export class ColourComponent implements Component {
  public fill: string;
  public stroke: string;

  constructor({
    fill = "lightBlue",
    stroke = "transparent",
  }: ColourOptions = {}) {
    this.fill = fill;
    this.stroke = stroke;
  }
}
