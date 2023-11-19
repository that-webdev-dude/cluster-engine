import { StyleOptions, TextOptions } from "../types";
import Entity from "./Entity";

const DEFAULTS = {
  fillStyle: "#68c3d4",
  font: '16px "Press Start 2P"',
};

class Text extends Entity {
  public style: StyleOptions;
  public text: string;

  constructor(options: TextOptions = {}) {
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
}

export default Text;
