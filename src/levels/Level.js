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
    for (let column = 0; column < mapW; column++) {
      for (let row = 0; row < mapH; row++) {
        level.push({
          x: math.rand(texture.width / tileW),
          y: math.rand(texture.height / tileH),
        });
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
