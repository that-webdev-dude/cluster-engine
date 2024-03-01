import Animation from "./Animation";
import Assets from "./Assets";
import Vector from "../tools/Vector";
import { Entity, EntityConfig } from "./Entity";
import { SpriteType, TileSpriteType } from "../types";

type SpriteConfig = EntityConfig &
  Partial<{
    textureURL: string;
    hitbox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;

class Sprite extends Entity implements SpriteType {
  readonly image: HTMLImageElement;
  readonly tag: string;
  private _hitbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;

  constructor(config: SpriteConfig = {}) {
    const { textureURL, hitbox } = config;

    if (!textureURL) throw new Error("Sprite requires a textureURL");

    super(config);
    this.tag = "sprite";
    this.image = Assets.image(textureURL);
    this._hitbox = hitbox || null;
  }

  get hitbox(): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    return (
      this._hitbox || {
        x: 0,
        y: 0,
        width: this.width,
        height: this.height,
      }
    );
  }

  set hitbox(hitbox: { x: number; y: number; width: number; height: number }) {
    this._hitbox = hitbox;
  }

  get width(): number {
    return this.image.width * this.scale.x;
  }

  get height(): number {
    return this.image.height * this.scale.y;
  }

  get center(): Vector {
    return new Vector(
      this.position.x + this.width * 0.5,
      this.position.y + this.height * 0.5
    );
  }

  get direction(): Vector {
    return Vector.clone(this.velocity).normalize();
  }

  get hitBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.position.x + this.hitbox.x,
      y: this.position.y + this.hitbox.y,
      width: this.hitbox.width,
      height: this.hitbox.height,
    };
  }

  public render(context: CanvasRenderingContext2D) {
    context.drawImage(this.image, 0, 0);
  }
}

type TileSpriteConfig = SpriteConfig &
  Partial<{
    tileW: number;
    tileH: number;
    frame: { x: number; y: number };
  }>;

class TileSprite extends Sprite implements TileSpriteType {
  private _tileW: number;
  private _tileH: number;
  private _frame: { x: number; y: number };
  readonly animation: Animation;
  readonly tag: string;

  constructor({
    tileW = 0,
    tileH = 0,
    frame = { x: 0, y: 0 },
    ...superConfig
  }: TileSpriteConfig) {
    if (tileW === 0 || tileH === 0)
      throw new Error("TileSprite requires tileW and tileH");

    super(superConfig);
    this._tileW = tileW;
    this._tileH = tileH;
    this._frame = frame;
    this.animation = new Animation({ frame: this._frame });
    this.tag = "tileSprite";
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

  public update(dt: number, t: number): void {
    if (this.animation.length > 0) {
      this.animation.update(dt);
      this._frame = this.animation.frame;
    }
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
}

export { Sprite, TileSprite };
