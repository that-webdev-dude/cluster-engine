import { Entity, EntityOptions } from "./Entity";
import Assets from "./Assets";

type SpriteOptions = EntityOptions & {
  textureURL?: string;
};

class Sprite extends Entity {
  private _texture: HTMLImageElement;

  constructor(options: SpriteOptions = { textureURL: "" }) {
    super(options);
    this._texture = Assets.image(options.textureURL || "");
  }

  get width() {
    return this._texture.width * this.scale.x;
  }

  get height() {
    return this._texture.height * this.scale.y;
  }

  get texture() {
    return this._texture;
  }
}

export default Sprite;
