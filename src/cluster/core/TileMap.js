import Container from "./Container";
import TileSprite from "./TileSprite";

class TileMap extends Container {
  /**
   * TileMap is a Container that positions TileSprites into a grid
   * @param {Array} tiles array of tile positions relative to texture [{x: number, y: number}, ...]
   * @param {number} mapW width of the map in number of tiles (columns)
   * @param {number} mapH height of the map in number of tiles (rows)
   * @param {number} tileW width of a single tile
   * @param {number} tileH height of a single tile
   * @param {Texture} texture image source
   */
  constructor(tiles, mapW, mapH, tileW, tileH, texture) {
    super();
    this.mapW = mapW;
    this.mapH = mapH;
    this.tileW = tileW;
    this.tileH = tileH;
    this.children = tiles.map((frame, index) => {
      const column = index % mapW;
      const row = Math.floor(index / mapW);
      const s = new TileSprite(texture, tileW, tileH);
      s.frame = frame;
      s.position.x = column * tileW;
      s.position.y = row * tileH;
      return s;
    });
  }

  /**
   * width:
   * width of the TileMap in pixels
   * @property
   * @readonly
   */
  get width() {
    return this.mapW * this.tileW;
  }

  /**
   * height:
   * height of the TileMap in pixels
   * @property
   * @readonly
   */
  get height() {
    return this.mapH * this.tileH;
  }

  /**
   * pixelToMapPosition()
   *
   * @param {*} pixelPosition
   * @returns
   */
  pixelToMapPosition(pixelPosition) {
    const { tileW, tileH } = this;
    return {
      x: Math.floor(pixelPosition.x / tileW),
      y: Math.floor(pixelPosition.y / tileH),
    };
  }

  /**
   * mapToPixelPosition()
   *
   * @param {*} mapPosition
   * @returns
   */
  mapToPixelPosition(mapPosition) {
    const { tileW, tileH } = this;
    return {
      x: mapPosition.x * tileW,
      y: mapPosition.y * tileH,
    };
  }

  /**
   * tileAtMapPosition()
   *
   * @param {*} mapPosition
   * @returns
   */
  tileAtMapPosition(mapPosition) {
    return this.children[mapPosition.y * this.mapW + mapPosition.x];
  }

  /**
   * tileAtPixelPosition()
   *
   * @param {*} position
   * @returns
   */
  tileAtPixelPosition(position) {
    return this.tileAtMapPosition(this.pixelToMapPosition(position));
  }

  /**
   * tilesAtCorners()
   *
   * @param {*} bounds
   * @param {*} xo
   * @param {*} yo
   * @returns
   */
  tilesAtCorners(bounds, xo = 0, yo = 0) {
    return [
      [bounds.x, bounds.y],
      [bounds.x + bounds.width, bounds.y],
      [bounds.x, bounds.y + bounds.height],
      [bounds.x + bounds.width, bounds.y + bounds.height],
    ].map(([x, y]) =>
      this.tileAtPixelPosition({
        x: x + xo,
        y: y + yo,
      })
    );
  }

  /**
   * setFrameAtMapPosition()
   *
   * @param {*} mapPosition
   * @param {*} frame
   * @returns
   */
  setFrameAtMapPosition(mapPosition, frame) {
    const tile = this.tileAtMapPosition(mapPosition);
    tile.frame = frame;
    return tile;
  }

  /**
   * setFrameAtPixelPosition()
   *
   * @param {*} position
   * @param {*} frame
   * @returns
   */
  setFrameAtPixelPosition(position, frame) {
    return this.setFrameAtMapPosition(this.pixelToMapPosition(position), frame);
  }
}

export default TileMap;
