import Animation from "./Animation";
import Assets from "./Assets";
import Vector from "../tools/Vector";
import { EntityType } from "../types";

// SPRITE CLASS DEFINITION
interface ISprite extends EntityType {
  image: HTMLImageElement;
}

interface ISpriteConfig {
  textureURL: string;
  position?: Vector;
  anchor?: Vector;
  scale?: Vector;
  pivot?: Vector;
  angle?: number;
  alpha?: number;
  dead?: boolean;
  acceleration?: Vector;
  velocity?: Vector;
  mass?: number;
  tag?: string;
  visible?: boolean;
}

class Sprite implements ISprite {
  public position: Vector;
  public anchor: Vector;
  public scale: Vector;
  public pivot: Vector;
  public angle: number;
  public alpha: number;
  public dead: boolean;
  public acceleration: Vector;
  public velocity: Vector;
  public mass: number;
  public tag: string;
  public visible: boolean;
  public hitbox: { x: number; y: number; width: number; height: number };
  readonly image: HTMLImageElement;

  constructor({
    textureURL,
    position = new Vector(),
    anchor = new Vector(),
    scale = new Vector(1, 1),
    pivot = new Vector(),
    angle = 0,
    alpha = 1,
    dead = false,
    acceleration = new Vector(),
    velocity = new Vector(),
    mass = 1,
    tag = "Sprite",
    visible = true,
  }: ISpriteConfig) {
    this.position = position;
    this.anchor = anchor;
    this.scale = scale;
    this.pivot = pivot;
    this.angle = angle;
    this.alpha = alpha;
    this.dead = dead;
    this.acceleration = acceleration;
    this.velocity = velocity;
    this.mass = mass;
    this.tag = tag;
    this.visible = visible;
    this.image = Assets.image(textureURL);
    this.hitbox = {
      x: 0,
      y: 0,
      width: this.image.width,
      height: this.image.height,
    };
  }

  get width(): number {
    return this.image.width * this.scale.x;
  }

  get height(): number {
    return this.image.height * this.scale.y;
  }

  public render(context: CanvasRenderingContext2D) {
    context.drawImage(this.image, 0, 0);
  }
}

// TILESPRITE CLASS DEFINITION
interface ITileSpriteConfig extends ISpriteConfig {
  tileW: number;
  tileH: number;
  frame?: { x: number; y: number };
}

class TileSprite extends Sprite {
  private _tileW: number;
  private _tileH: number;
  private _frame: { x: number; y: number };
  readonly animation: Animation;

  constructor({
    tileW,
    tileH,
    frame = { x: 0, y: 0 },
    ...superConfig
  }: ITileSpriteConfig) {
    super(superConfig);
    this._tileW = tileW;
    this._tileH = tileH;
    this._frame = frame;
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
