import Vector from "../tools/Vector";
import { EntityType } from "../types";

// TEXT CLASS DEFINITION
interface IText extends EntityType {
  text: string;
}

interface ITextConfig {
  text?: string;
  font?: string;
  fill?: string;
  stroke?: string;
  lineWidth?: number;
  align?: CanvasTextAlign;
  position?: Vector;
  anchor?: Vector;
  scale?: Vector;
  pivot?: Vector;
  angle?: number;
  alpha?: number;
  dead?: boolean;
}

class Text implements IText {
  public text: string;
  public font: string;
  public fill: string;
  public stroke: string;
  public lineWidth: number;
  public align: CanvasTextAlign;
  public position: Vector;
  public anchor: Vector;
  public scale: Vector;
  public pivot: Vector;
  public angle: number;
  public alpha: number;
  public dead: boolean;

  constructor({
    text = "text",
    font = '16px "Press Start 2P"',
    fill = "black",
    stroke = "transparent",
    lineWidth = 0,
    align = "center" as CanvasTextAlign,
    position = new Vector(),
    anchor = new Vector(),
    scale = new Vector(1, 1),
    pivot = new Vector(),
    angle = 0,
    alpha = 1,
    dead = false,
  }: ITextConfig) {
    this.text = text;
    this.font = font;
    this.fill = fill;
    this.stroke = stroke;
    this.lineWidth = lineWidth;
    this.align = align;
    this.position = position;
    this.anchor = anchor;
    this.scale = scale;
    this.pivot = pivot;
    this.angle = angle;
    this.alpha = alpha;
    this.dead = dead;
  }

  public render(context: CanvasRenderingContext2D) {
    const { font, fill, stroke, lineWidth, text, align } = this;
    context.font = font;
    context.fillStyle = fill;
    context.strokeStyle = stroke;
    context.lineWidth = lineWidth;
    context.textAlign = align;
    context.strokeText(text, 0, 0);
    context.fillText(text, 0, 0);
  }
}

export default Text;
