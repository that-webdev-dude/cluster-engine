import Assets from "./Assets";
import Vector from "../tools/Vector";
import { IEntity, IEntityConfig, IENTITY_DEFAULTS } from "../types";

// Sprite
type SpriteConfig = IEntityConfig & {
  textureURL?: string;
};

const SPRITE_DEFAULTS = {
  textureURL: "",
};

class Sprite implements IEntity {
  public position: Vector;
  public anchor: Vector;
  public scale: Vector;
  public pivot: Vector;
  public angle: number;
  public alpha: number;
  public dead: boolean;
  public image: HTMLImageElement;

  constructor(config: SpriteConfig = {}) {
    const { position, anchor, scale, pivot, angle, alpha, dead, textureURL } = {
      ...IENTITY_DEFAULTS,
      ...SPRITE_DEFAULTS,
      ...config,
    };

    this.position = position;
    this.anchor = anchor;
    this.scale = scale;
    this.pivot = pivot;
    this.angle = angle;
    this.alpha = alpha;
    this.dead = dead;
    this.image = Assets.image(textureURL || "");
  }

  get width(): number {
    return this.image.width * this.scale.x;
  }

  get height(): number {
    return this.image.height * this.scale.y;
  }

  public render(context: CanvasRenderingContext2D): void {
    context.drawImage(this.image, 0, 0);
  }

  public update(delta: number, elapsed: number) {}
}

export default Sprite;
