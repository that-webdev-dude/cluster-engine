import { Component } from "../../core/Component";

// Interface for component properties
export interface TextOptions {
  align?: CanvasTextAlign;
  font?: string;
  message?: string;
}

// Text Component
export class TextComponent implements Component {
  align: CanvasTextAlign;
  font: string;
  message: string;

  constructor({
    align = "center",
    font = "16px Arial",
    message = "",
  }: TextOptions = {}) {
    this.align = align;
    this.font = font;
    this.message = message;
  }
}
