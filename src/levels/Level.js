import tilesImageURL from "../images/tiles.png";
import cluster from "../cluster";

const { Texture, TileMap, math } = cluster;

// const TILE_SIZE = 32;
// prettier-ignore
// const LEVEL_MAP = [
//   '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '7',
//   '6', '9', '9', '9', '9', '9', '9', '9', '9', '9', '9', '9', '9', '9', '9', '9', '9', '9', '9', '8',
//   '6', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '8',
//   '6', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '8',
//   '6', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '8',
//   '6', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '8',
//   '6', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '8',
//   '6', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '8',
//   '6', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '8',
//   '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '7',
// ]

class Level extends TileMap {
  constructor(width, height) {
    const texture = new Texture(tilesImageURL);
    const mapW = width / 32;
    const mapH = height / 32;
    const tileW = 32;
    const tileH = 32;
    const level = [];

    for (let i = 0; i < mapW * mapH; i++) {
      const isTopOrBottom = i < mapW || Math.floor(i / mapW) === mapH - 1;
      const isLeft = i % mapW === 0;
      const isRight = i % mapW === mapW - 1;
      const isSecondRow = ((i / mapW) | 0) === 1;

      if (isTopOrBottom) {
        level.push({ x: 2, y: 1 });
      } else if (isLeft) {
        level.push({ x: 1, y: 1 });
      } else if (isRight) {
        level.push({ x: 3, y: 1 });
      } else if (isSecondRow) {
        level.push({ x: 4, y: 1 });
      } else {
        // Random ground tile
        level.push({ x: math.rand(1, 5), y: 0 });
      }
    }

    // let textureRows = 5;
    // LEVEL_MAP.forEach((symbol) => {
    //   let val = parseInt(symbol);
    //   if (val === 0) {
    //     level.push({ x: math.rand(1, 5), y: 0 });
    //   } else {
    //     let row = Math.floor(val / textureRows);
    //     let col = val % textureRows;
    //     level.push({ x: col, y: row });
    //   }
    // });

    // initialize
    super(level, mapW, mapH, tileW, tileH, texture);
    this.blankFrame = { x: 0, y: 0 };
    this.lastTile = null;
    this.bounds = {
      top: tileH * 2,
      right: width - tileW * 2,
      bottom: height - tileH * 2,
      left: tileW,
    };
  }

  checkGround(position) {
    const { blankFrame, lastTile } = this;
    const tile = this.tileAtPixelPosition(position);
    if (tile === lastTile) return "checked";
    this.lastTile = tile;
    if (tile.frame !== blankFrame) {
      this.setFrameAtPixelPosition(position, blankFrame);
      return "solid";
    }
    return "cleared";
  }
}

export default Level;
