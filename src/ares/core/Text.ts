import Vector from "../tools/Vector";
import { EntityType } from "../types";

// TEXT CLASS DEFINITION
interface IText extends EntityType {
  text: string;
}

interface ITextConfig {
  text?: string;
  fill?: string;
  font?: string;
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
  public fill: string;
  public font: string;
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
    fill = "black",
    font = '16px "Press Start 2P"',
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
    this.fill = fill;
    this.font = font;
    this.align = align;
    this.position = position;
    this.anchor = anchor;
    this.scale = scale;
    this.pivot = pivot;
    this.angle = angle;
    this.alpha = alpha;
    this.dead = dead;
  }

  // get width(): number {
  //   return 0;
  // }

  // get height(): number {
  //   return 0;
  // }

  public render(context: CanvasRenderingContext2D) {
    const { font, fill, text, align } = this;
    context.font = font;
    context.fillStyle = fill;
    context.textAlign = align;
    context.fillText(text, 0, 0);
  }
}

export default Text;
