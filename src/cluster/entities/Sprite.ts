import { Animation } from "../core/Animation";
import { Entity } from "../core/Entity";
import { Assets } from "../core/Assets";
import { Cluster } from "../types/cluster.types";

// TODO
// maybe a tilesprite is a sprite? sprite redundant?

export class Sprite extends Entity implements Cluster.SpriteType {
  public image: HTMLImageElement;
  constructor(options: Cluster.SpriteOptions) {
    const { imageURL, ...optionals } = options;
    super(Cluster.EntityTag.SPRITE, optionals as Cluster.EntityOptions);
    this.image = Assets.image(imageURL);
  }
}

export class TileSprite extends Sprite implements Cluster.TileSpriteType {
  readonly tag: Cluster.EntityTag = Cluster.EntityTag.TILESPRITE; // Shadowing the sprite tag
  readonly tileWidth: number;
  readonly tileHeight: number;
  readonly animation: Animation;
  constructor(options: Cluster.TileSpriteOptions) {
    const { tileWidth = 32, tileHeight = 32, ...optionals } = options;
    super(optionals as Cluster.SpriteOptions);
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.animation = new Animation({
      frame: { x: 0, y: 0 },
    });
  }

  get frame() {
    return this.animation.frame;
  }

  set frame(frame) {
    this.animation.frame = frame;
  }

  public update(dt: number) {
    this.animation.update(dt);
  }
}
