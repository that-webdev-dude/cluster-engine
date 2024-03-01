import { TextType } from "../types";
import { Entity, EntityConfig } from "./Entity";

const DEFAULT_STYLE = {
  align: "center" as CanvasTextAlign,
  font: '16px "Press Start 2P"',
  fill: "black",
  stroke: "transparent",
  lineWidth: 1,
};

type TextConfig = EntityConfig &
  Partial<{
    text: string;
    font: string;
    fill: string;
    stroke: string;
    lineWidth: number;
    align: CanvasTextAlign;
  }>;

class Text extends Entity implements TextType {
  tag: string;
  text: string;
  font: string;
  fill: string;
  stroke: string;
  lineWidth: number;
  align: CanvasTextAlign;

  constructor(config: TextConfig = {}) {
    const {
      text = "text",
      font = DEFAULT_STYLE.font,
      fill = DEFAULT_STYLE.fill,
      align = DEFAULT_STYLE.align,
      stroke = DEFAULT_STYLE.stroke,
      lineWidth = DEFAULT_STYLE.lineWidth,
    } = config;

    super(config);
    this.tag = "text";
    this.text = text;
    this.font = font;
    this.fill = fill;
    this.align = align;
    this.stroke = stroke;
    this.lineWidth = lineWidth;
  }

  public render(context: CanvasRenderingContext2D) {
    context.font = this.font;
    context.fillStyle = this.fill;
    context.strokeStyle = this.stroke;
    context.lineWidth = this.lineWidth;
    context.textAlign = this.align;
    context.strokeText(this.text, 0, 0);
    context.fillText(this.text, 0, 0);
  }
}

export default Text;
