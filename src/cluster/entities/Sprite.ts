import { Animation } from "../core/Animation";
import { Container } from "../core/Container";
import { Entity } from "../core/Entity";
import { Assets } from "../core/Assets";
import { Vector } from "../tools/Vector";
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

  get width() {
    return this.image.width;
  }

  get height() {
    return this.image.height;
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

  get width() {
    return this.tileWidth;
  }

  get height() {
    return this.tileHeight;
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

type TileFrame = { x: number; y: number; walkable?: boolean };
type MapLayout = string[][];
type MapDictionary = {
  [key: string]: TileFrame;
};
export class TileMap extends Container {
  tileHeight: number;
  tileWidth: number;
  noRows: number;
  noCols: number;
  // mapData: MapData = [];

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

    this.noRows = mapLayout.length;
    this.noCols = mapLayout[0].length;

    mapLayout.forEach((row, y) => {
      return row.forEach((cell, x) => {
        const frame = mapDictionary[cell];
        if (frame) {
          const tile = new TileSprite({
            position: new Vector(x * tileWidth, y * tileHeight),
            imageURL: mapSpritesheetURL,
            tileWidth,
            tileHeight,
          });
          // const { x: frameX, y: frameY, walkable = true } = frame;
          // tile.frame = { x: frameX, y: frameY, walkable } as TileFrame;
          tile.frame = frame as TileFrame;
          this.add(tile);
        }
      });
    });

    if (this.children[0] instanceof TileSprite) {
      let frame = this.children[0].frame as TileFrame;
      console.log(frame);
    }
  }

  /**
   * pixelToMapPosition():
   * converts a pixel position to a map position
   * @param pixelPosition the pixel position to convert to map position
   * @returns the map position
   */
  pixelToMapPosition(pixelPosition: Cluster.Point): Cluster.Point {
    const { tileWidth, tileHeight } = this;
    return {
      x: Math.floor(pixelPosition.x / tileWidth),
      y: Math.floor(pixelPosition.y / tileHeight),
    };
  }

  /**
   * mapToPixelPosition():
   * converts a map position to a pixel position
   * @param mapPosition the map position to convert to pixel position
   * @returns the pixel position
   */
  mapToPixelPosition(mapPosition: Cluster.Point): Cluster.Point {
    const { tileWidth, tileHeight } = this;
    return {
      x: mapPosition.x * tileWidth,
      y: mapPosition.y * tileHeight,
    };
  }

  tileAtMapPosition(mapPosition: Cluster.Point): void {
    // console.log(mapPosition);
    // return this.children[mapPosition.y * this.noCols + mapPosition.x];
  }
}
