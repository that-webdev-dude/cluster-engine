import { Entity, EntityConfig, ENTITY_DEFAULTS } from "./Entity";

// Text
interface TextConfig extends EntityConfig {
  font?: string;
  fill?: string;
  text?: string;
  align?: CanvasTextAlign;
}

const TEXT_DEFAULTS = {
  font: '10px "Press Start 2P"',
  fill: "black",
  text: "my text",
  align: "center" as CanvasTextAlign,
};

class Text extends Entity {
  public font: string;
  public fill: string;
  public text: string;
  public align: CanvasTextAlign;

  constructor(
    config: TextConfig = {
      ...ENTITY_DEFAULTS,
      ...TEXT_DEFAULTS,
    }
  ) {
    super(config);
    this.font = config.font || TEXT_DEFAULTS.font;
    this.fill = config.fill || TEXT_DEFAULTS.fill;
    this.text = config.text || TEXT_DEFAULTS.text;
    this.align = config.align || TEXT_DEFAULTS.align;
  }

  render(context: CanvasRenderingContext2D): void {
    const { font, fill, text, align } = this;
    context.font = font;
    context.fillStyle = fill;
    context.textAlign = align;
    context.fillText(text, 0, 0);
  }

  public update(dt: number, t: number): void {
    // noop
  }
}

export type { Text };
export default Text;
