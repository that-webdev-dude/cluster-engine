import { Component } from "../../core/Component";

// Interface for component properties
export interface TextOptions {
  align?: CanvasTextAlign;
  font?: string;
  string?: string;
}

// Text Component
export class TextComponent implements Component {
  align: CanvasTextAlign;
  font: string;
  string: string;

  constructor({
    align = "center",
    font = "16px Arial",
    string = "",
  }: TextOptions = {}) {
    this.align = align;
    this.font = font;
    this.string = string;
  }
}
