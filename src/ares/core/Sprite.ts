import { SpriteOptions, TileSpriteOptions } from "../types";
import { Entity } from "./Entity";
import Animation from "./Animation";
import Assets from "./Assets";

class Sprite extends Entity {
  private _texture: HTMLImageElement;

  constructor(
    options: SpriteOptions = {
      textureURL: "",
    }
  ) {
    const image = Assets.image(options.textureURL || "");
    super({
      ...options,
      width: image.width,
      height: image.height,
    });
    this._texture = image;
  }

  get texture(): HTMLImageElement {
    return this._texture;
  }

  render(context: CanvasRenderingContext2D): void {
    context.drawImage(this._texture, 0, 0);
  }
}

export default Sprite;
