import { Entity, EntityOptions } from "./Entity";

interface CanvasStyleOptions {
  fill?: string;
  font?: string;
  align?: CanvasTextAlign;
}

interface CanvasTextOptions extends EntityOptions {
  text?: string;
  style?: CanvasStyleOptions;
}

class CanvasText extends Entity {
  public style: CanvasStyleOptions;
  public text: string;

  constructor(options: CanvasTextOptions = {}) {
    super(options);
    this.style = options.style || {};
    this.text = options.text || "";
  }
}

export default CanvasText;
