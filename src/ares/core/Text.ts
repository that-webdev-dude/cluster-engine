import { Entity, EntityOptions } from "./Entity";

type CanvasStyleOptions = {
  fill?: string;
  font?: string;
  align?: CanvasTextAlign;
};

type CanvasTextOptions = EntityOptions & {
  text?: string;
  style?: CanvasStyleOptions;
};

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
