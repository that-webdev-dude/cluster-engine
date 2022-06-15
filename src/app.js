import playerImageURL from "./images/player.png";
import tilesImageURL from "./images/tiles.png";
import levelImageURL from "./images/level.png";
import cluster from "./cluster/index.js";
import Texture from "./cluster/core/Texture";
import math from "./cluster/utils/math";
import TileMap from "./cluster/core/TileMap";
const { Game } = cluster;

export default () => {
  // setup
  const width = 640;
  const height = 320;
  const game = new Game({ width, height });

  // controller
  // ...

  // game level
  const tileW = 32;
  const tileH = 32;
  const mapW = width / 32;
  const mapH = height / 32;
  const tiles = [];
  for (let column = 0; column < mapW; column++) {
    for (let row = 0; row < mapH; row++) {
      tiles.push({ x: math.rand(512 / 32), y: math.rand(512 / 32) });
    }
  }
  const map = new TileMap(tiles, mapW, mapH, tileW, tileH, new Texture(levelImageURL));

  // game objects
  game.scene.add(map);

  // game logic
  game.run((dt, t) => {});
};
