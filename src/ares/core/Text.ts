import { IEntityConfig, ENTITY_DEFAULTS } from "./Entity";
import Vector from "../tools/Vector";

// Text
type TextConfig = IEntityConfig & {
  font?: string;
  fill?: string;
  text?: string;
  align?: CanvasTextAlign;
};

const TEXT_DEFAULTS = {
  font: '10px "Press Start 2P"',
  fill: "black",
  text: "my text",
  align: "center" as CanvasTextAlign,
};

class Text {
  public font: string;
  public fill: string;
  public text: string;
  public align: CanvasTextAlign;
  public position: Vector;
  public anchor: Vector;
  public scale: Vector;
  public pivot: Vector;
  public angle: number;
  public alpha: number;
  public dead: boolean;

  constructor(config: TextConfig = {}) {
    const {
      position,
      anchor,
      scale,
      pivot,
      angle,
      alpha,
      dead,
      font,
      fill,
      text,
      align,
    } = { ...ENTITY_DEFAULTS, ...TEXT_DEFAULTS, ...config };

    this.position = position;
    this.anchor = anchor;
    this.scale = scale;
    this.pivot = pivot;
    this.angle = angle;
    this.alpha = alpha;
    this.dead = dead;
    this.font = font;
    this.fill = fill;
    this.text = text;
    this.align = align;
  }

  public render(context: CanvasRenderingContext2D): void {
    const { font, fill, text, align } = this;
    context.font = font;
    context.fillStyle = fill;
    context.textAlign = align;
    context.fillText(text, 0, 0);
  }

  public update(delta: number, elapsed: number) {}
}

export default Text;
