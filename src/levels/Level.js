import tilesImageURL from "../images/tiles.png";
import cluster from "../cluster";

const { Texture, TileMap, math } = cluster;

class Level extends TileMap {
  constructor(width, height) {
    // level setup
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

    // initialize
    super(level, mapW, mapH, tileW, tileH, texture);
    this.bounds = {
      top: tileH,
      right: width - tileW * 2,
      bottom: height - tileH * 2,
      left: tileW,
    };
  }
}

export default Level;
