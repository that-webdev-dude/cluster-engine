import { Animation } from "../core/Animation";
import { Container } from "../core/Container";
import { Entity } from "../core/Entity";
import { Assets } from "../core/Assets";
import { Cluster } from "../types/cluster.types";

import spritesheetImageURL from "../../images/spritesheet.png";
import { Vector } from "../tools/Vector";

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

type MapData = TileSprite[][];
type MapLayout = string[][];
type MapDictionary = { [key: string]: { x: number; y: number } };
export class TileMap extends Container {
  tileHeight: number;
  tileWidth: number;
  mapData: MapData = [];

  constructor(
    mapSpritesheetURL: string,
    mapDictionary: MapDictionary,
    mapLayout: MapLayout,
    tileWidth: number,
    tileHeight: number
  ) {
    super();

    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    mapLayout.forEach((row, y) => {
      return row.map((cell, x) => {
        const tile = new TileSprite({
          position: new Vector(x * tileWidth, y * tileHeight),
          imageURL: mapSpritesheetURL,
          tileWidth,
          tileHeight,
        });
        tile.frame = mapDictionary[cell];
        this.add(tile);
      });
    });
  }
}
