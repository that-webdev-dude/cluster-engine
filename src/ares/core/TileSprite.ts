import Animation from "./Animation";
import Sprite from "./Sprite";
import { SpriteConfig } from "./Sprite";

type TileSpriteConfig = SpriteConfig & {
  tileW: number;
  tileH: number;
  frame?: { x: number; y: number };
};

class TileSprite extends Sprite {
  private _tileW: number;
  private _tileH: number;
  private _frame: { x: number; y: number };
  readonly animation: Animation;

  constructor(config: TileSpriteConfig) {
    const { tileW, tileH, frame, ...superConfig } = config;
    super(config);
    this._tileW = tileW;
    this._tileH = tileH;
    this._frame = frame || { x: 0, y: 0 };
    this.animation = new Animation({ frame: this._frame });
  }

  get frame(): { x: number; y: number } {
    return this._frame;
  }

  set frame(frame: { x: number; y: number }) {
    this._frame = frame;
    this.animation.frame = frame;
  }

  get width(): number {
    return this._tileW * this.scale.x;
  }

  get height(): number {
    return this._tileH * this.scale.y;
  }

  render(context: CanvasRenderingContext2D): void {
    context.drawImage(
      this.image,
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

  public update(dt: number, t: number): void {
    if (this.animation.length > 0) {
      this.animation.update(dt);
      this._frame = this.animation.frame;
    }
  }
}

export default TileSprite;
