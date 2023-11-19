import { SpriteOptions } from "../types";
import Entity from "./Entity";
import Assets from "./Assets";
import Container from "./Container";
import Animation from "./Animation";

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
}

// TileSpriteOptions
// interface that defines the options that can be passed to a TileSprite.
type TileSpriteOptions = SpriteOptions & {
  frame?: { x: number; y: number };
  tileW: number;
  tileH: number;
};

class TileSprite extends Sprite {
  private _tileW: number;
  private _tileH: number;
  private _frame: { x: number; y: number };
  readonly animation: Animation;

  constructor(options: TileSpriteOptions) {
    super(options);
    this._tileW = options.tileW;
    this._tileH = options.tileH;
    this._frame = options.frame || { x: 0, y: 0 };
    this.animation = new Animation({ frame: this._frame });
  }

  get width(): number {
    return this._tileW * this.scale.x;
  }

  get height(): number {
    return this._tileH * this.scale.y;
  }

  render(context: CanvasRenderingContext2D): void {
    context.drawImage(
      this.texture,
      this._frame.x * this._tileW,
      this._frame.y * this._tileH,
      this._tileW,
      this._tileH,
      0,
      0,
      this._tileW,
      this._tileH
    );
  }

  public update(dt: number, t: number, parent?: Container | undefined): void {
    this.animation.update(dt);
    // this._frame = this.animation.frame;
  }
}

export default Sprite;
