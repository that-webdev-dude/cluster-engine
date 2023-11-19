import { StyleOptions, RectOptions, CircleOptions } from "../types";
import Entity from "./Entity";

const DEFAULTS = {
  strokeStyle: "transparent",
  lineWidth: 1,
  fillStyle: "#68c3d4",
  textAlign: "center",
  font: '10px "Press Start 2P"',
};

class Rect extends Entity {
  public style: StyleOptions;

  constructor(options: RectOptions) {
    super(options);
    this.style = options.style || {};
  }

  render(context: CanvasRenderingContext2D): void {
    const { style } = this;
    const { stroke, fill, lineWidth } = style;
    const { width, height } = this;
    context.fillStyle = fill || DEFAULTS.fillStyle;
    context.lineWidth = lineWidth || DEFAULTS.lineWidth;
    context.strokeStyle = stroke || DEFAULTS.strokeStyle;
    context.beginPath();
    context.rect(0, 0, width, height);
    context.stroke();
    context.fill();
  }
}

class Circle extends Entity {
  public radius: number;
  public style: StyleOptions;

  constructor(options: CircleOptions) {
    super({
      ...options,
      width: options.radius * 2,
      height: options.radius * 2,
    });
    this.radius = options.radius || 50;
    this.style = options.style || {};

    this.anchor.set(this.radius, this.radius);
  }

  render(context: CanvasRenderingContext2D): void {
    const { style } = this;
    const { stroke, fill, lineWidth } = style;
    const { radius } = this;
    context.fillStyle = fill || DEFAULTS.fillStyle;
    context.lineWidth = lineWidth || DEFAULTS.lineWidth;
    context.strokeStyle = stroke || DEFAULTS.strokeStyle;
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.stroke();
    context.fill();
  }
}

export { Rect, Circle };
