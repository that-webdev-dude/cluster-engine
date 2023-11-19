import { SpriteOptions } from "../types";
import Entity from "./Entity";
import Assets from "./Assets";

class Sprite extends Entity {
  readonly texture: HTMLImageElement;

  constructor(
    options: SpriteOptions = {
      textureURL: "",
    }
  ) {
    const image = Assets.image(options.textureURL || "");
    super(options);
    this.texture = image;
  }

  get width(): number {
    return this.texture.width * this.scale.x;
  }

  get height(): number {
    return this.texture.height * this.scale.y;
  }

  render(context: CanvasRenderingContext2D): void {
    context.drawImage(this.texture, 0, 0);
  }

  update(dt: number, t: number): void {}
}

export default Sprite;
