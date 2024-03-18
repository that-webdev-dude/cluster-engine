import { Vector } from "../tools/Vector";
import { Entity } from "../core/Entity";
import { Cluster } from "../types/cluster.types";
import { Assets } from "../core/Assets";
import { Animation } from "../core/Animation";
import { Container } from "../core/Container";

// implementation of a Sprite Entity class
export class Sprite
  extends Entity
  implements Cluster.EntityType<Cluster.SpriteOptions>
{
  readonly tag = Cluster.EntityTag.SPRITE; // Discriminant property
  readonly image: HTMLImageElement;
  readonly imageURL: string;

  constructor(options: Cluster.SpriteOptions) {
    super(Cluster.EntityTag.SPRITE, options);
    this.image = Assets.image(options.imageURL);
    this.imageURL = options.imageURL;
  }

  get width() {
    return this.image.width;
  }

  get height() {
    return this.image.height;
  }

  get center() {
    return new Vector(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
  }

  get boundingBox() {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }
}

// implementation of a Sprite Entity class
export class TileSprite
  extends Entity
  implements Cluster.EntityType<Cluster.TileSpriteOptions>
{
  readonly tag = Cluster.EntityTag.TILESPRITE; // Discriminant property
  readonly image: HTMLImageElement;
  readonly imageURL: string;
  readonly tileWidth: number;
  readonly tileHeight: number;
  readonly animation: Animation;

  constructor(options: Cluster.TileSpriteOptions) {
    super(Cluster.EntityTag.TILESPRITE, options);
    this.image = Assets.image(options.imageURL);
    this.imageURL = options.imageURL;
    this.tileWidth = options.tileWidth;
    this.tileHeight = options.tileHeight;
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

  get width() {
    return this.tileWidth;
  }

  get height() {
    return this.tileHeight;
  }

  get center() {
    return new Vector(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
  }

  get boundingBox() {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.tileWidth,
      height: this.tileHeight,
    };
  }

  public update(dt: number) {
    this.animation.update(dt);
  }
}

// // implementation of a Tile Sprite Entity class
// export class TileSprite
//   extends Sprite
//   implements Cluster.EntityType<Cluster.TileSpriteOptions>
// {
//   readonly tileWidth: number;
//   readonly tileHeight: number;
//   readonly animation: Animation;

//   constructor(options: Cluster.TileSpriteOptions) {
//     super(options);
//     this.tileWidth = options.tileWidth;
//     this.tileHeight = options.tileHeight;
//     this.animation = new Animation({
//       frame: { x: 0, y: 0 },
//     });
//   }

//   get width() {
//     return this.tileWidth;
//   }

//   get height() {
//     return this.tileHeight;
//   }

//   get frame() {
//     return this.animation.frame;
//   }

//   set frame(frame) {
//     this.animation.frame = frame;
//   }

//   public update(dt: number) {
//     this.animation.update(dt);
//   }
// }

// implementation of TileMap
type TileFrame = { x: number; y: number; walkable?: boolean };
type MapLayout = string[][];
type MapDictionary = {
  [key: string]: TileFrame;
};
export class TileMap extends Container {
  tileHeight: number;
  tileWidth: number;
  mapHeight: number;
  mapWidth: number;
  tiles: Map<number, TileSprite> = new Map();

  /**
   * TileMap():
   * creates a tilemap from a given spritesheet and map layout
   * @param mapSpritesheetURL the URL of the spritesheet to use for the tilemap
   * @param mapDictionary the dictionary of tile frames to use for the tilemap
   * @param mapLayout the layout of the tilemap
   * @param tileWidth the width of each tile
   * @param tileHeight the height of each tile
   */
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

    // check for mapWidth to ensure the map is rectangular
    this.mapHeight = mapLayout.length;
    this.mapWidth = mapLayout[0].length;
    for (let i = 1; i < mapLayout.length; i++) {
      if (mapLayout[i].length !== this.mapWidth) {
        throw new Error("Map layout is not rectangular");
      }
    }

    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const cell = mapLayout[y][x];
        const frame = mapDictionary[cell];
        if (frame) {
          let index = y * this.mapWidth + x;
          let row = Math.floor(index / this.mapWidth);
          let col = index % this.mapWidth;
          let position = new Vector(col * tileWidth, row * tileHeight);
          let tileSprite = new TileSprite({
            imageURL: mapSpritesheetURL,
            position,
            tileWidth,
            tileHeight,
          });
          tileSprite.frame = frame;
          this.tiles.set(index, tileSprite);
          this.add(tileSprite);
        }
      }
    }
  }

  get width() {
    return this.mapWidth * this.tileWidth;
  }

  get height() {
    return this.mapHeight * this.tileHeight;
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

  /**
   * tileAtMapPosition():
   * returns the tile at a given map position
   * @param mapPosition the map position to check for a tile
   * @returns the tile at the map position
   */
  tileAtMapPosition(mapPosition: Cluster.Point): TileSprite | undefined {
    return this.tiles.get(mapPosition.y * this.mapWidth + mapPosition.x);
  }

  /**
   * tileAtPixelPosition():
   * returns the tile at a given pixel position
   * @param pixelPosition the pixel position to check for a tile
   * @returns the tile at the pixel position
   */
  tileAtPixelPosition(pixelPosition: Cluster.Point): TileSprite | undefined {
    return this.tileAtMapPosition(this.pixelToMapPosition(pixelPosition));
  }

  /**
   * setFrameAtMapPosition():
   * sets the frame of the tile at a given map position
   * @param mapPosition the map position to set the frame of the tile
   * @param frame the frame to set the tile to at the map position
   */
  setFrameAtMapPosition(mapPosition: Cluster.Point, frame: TileFrame) {
    const tile = this.tileAtMapPosition(mapPosition);
    if (tile) {
      tile.frame = frame;
    }
  }

  /**
   * setFrameAtPixelPosition():
   * sets the frame of the tile at a given pixel position
   * @param pixelPosition the pixel position to set the frame of the tile
   * @param frame the frame to set the tile to at the pixel position
   */
  setFrameAtPixelPosition(pixelPosition: Cluster.Point, frame: TileFrame) {
    this.setFrameAtMapPosition(this.pixelToMapPosition(pixelPosition), frame);
  }

  /**
   * deleteTileAtMapPosition():
   * deletes the tile at a given map position
   * @param mapPosition the map position to delete the tile
   */
  deleteTileAtMapPosition(mapPosition: Cluster.Point) {
    const tile = this.tileAtMapPosition(mapPosition);
    if (tile) {
      this.remove(tile);
      tile.dead = true;
    }
  }

  /**
   * deleteTileAtPixelPosition():
   * deletes the tile at a given pixel position
   * @param pixelPosition the pixel position to delete the tile
   */
  deleteTileAtPixelPosition(pixelPosition: Cluster.Point) {
    this.deleteTileAtMapPosition(this.pixelToMapPosition(pixelPosition));
  }

  /**
   * tilesAtRectCorners():
   * returns the tiles at the corners of a given bounding box
   * @param x the x position of the bounding box
   * @param y the y position of the bounding box
   * @param width the width of the bounding box
   * @param height the height of the bounding box
   * @param offsetX the x offset of the bounding box
   * @param offsetY the y offset of the bounding box
   * @returns the tiles within the bounding box
   */
  tilesAtBoxCorners(
    pixelPosition: Cluster.Point,
    width: number,
    height: number,
    offsetX: number = 0,
    offsetY: number = 0
  ): (TileSprite | undefined)[] {
    let { x, y } = pixelPosition;
    return [
      [x, y], // top left
      [x + width, y], // top right
      [x, y + height], // bottom left
      [x + width, y + height], // bottom right
    ].map(([x, y]) =>
      this.tileAtPixelPosition({
        x: x + offsetX,
        y: y + offsetY,
      })
    );
  }
}
