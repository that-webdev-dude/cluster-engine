import Sprite from "./Sprite";
import Animation from "./Animation";
import { TileSpriteOptions } from "../types";

class TileSprite extends Sprite {
  private _tileW: number;
  private _tileH: number;
  private _frame: { x: number; y: number };
  private _animation: Animation;

  constructor(
    options: TileSpriteOptions = {
      textureURL: "",
      tileW: 0,
      tileH: 0,
    }
  ) {
    super(options);
    this._tileW = options.tileW;
    this._tileH = options.tileH;
    this._frame = { x: 0, y: 0 };
    this._animation = new Animation({ frame: this._frame });
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
}
