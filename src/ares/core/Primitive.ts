import { EntityConfig } from "./Entity";
import Entity from "./Entity";

type StyleConfig = {
  align?: CanvasTextAlign;
  font?: string;
  fill?: string;
  stroke?: string;
  lineWidth?: number;
};

const DEFAULTS = {
  strokeStyle: "transparent",
  lineWidth: 1,
  fillStyle: "#68c3d4",
  textAlign: "center",
  font: '10px "Press Start 2P"',
};

type RectConfig = EntityConfig & {
  style?: StyleConfig;
};

class Rect extends Entity {
  public style: StyleConfig;

  constructor(options: RectConfig) {
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

  update(dt: number, t: number): void {}
}

type CircleConfig = EntityConfig & {
  radius: number;
  style?: StyleConfig;
};

class Circle extends Entity {
  public radius: number;
  public style: StyleConfig;

  constructor(options: CircleConfig) {
    super({
      ...options,
      width: options.radius * 2,
      height: options.radius * 2,
    });
    this.radius = options.radius || 50;
    this.style = options.style || {};

    this.anchor.x = this.radius;
    this.anchor.y = this.radius;
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

  update(dt: number, t: number): void {}
}

type TextConfig = EntityConfig & {
  text?: string;
  style?: StyleConfig;
};

class Text extends Entity {
  public style: StyleConfig;
  public text: string;

  constructor(options: TextConfig = {}) {
    super(options);
    this.style = options.style || {};
    this.text = options.text || "";
  }

  render(context: CanvasRenderingContext2D): void {
    const { text, style } = this;
    const { fill, font, align } = style;
    context.font = font || DEFAULTS.font;
    context.fillStyle = fill || DEFAULTS.fillStyle;
    context.textAlign = align || "left";
    context.fillText(text, 0, 0);
  }

  update(dt: number, t: number): void {}
}

export default {
  Text,
  Rect,
  Circle,
};
