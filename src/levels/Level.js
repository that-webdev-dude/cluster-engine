import tilesImageURL from "../images/tiles.png";
import Texture from "../cluster/core/Texture";
import TileMap from "../cluster/core/TileMap";
import Vector from "../cluster/utils/Vector";
import math from "../cluster/utils/math";

// prettier-ignore
const levelMap = [
  '#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#',
  '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','B',' ',' ',' ',' ',' ',' ','#',
  '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','$','#',
  '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#','#','#','#','#','#','#','#','#',
  '#',' ',' ','$',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','T','#',
  '#',' ',' ','#','#','#','#','#','#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
  '#',' ',' ',' ',' ',' ',' ',' ','#','#','#','#','#','#','#',' ',' ',' ',' ','#',
  '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#','#',
  '#',' ',' ','B',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#','#','#',
  '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','$',' ',' ',' ',' ','#','#','#','#',
  '#','$',' ',' ','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#',
  '#','#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
  '#','#','#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
  '#','#','#','#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
  '#','#','#','#','#',' ',' ','#','#','#','#',' ',' ',' ',' ',' ',' ',' ',' ','#',
  '#','#',' ',' ',' ',' ',' ',' ','#','#','#','#','#','#','#',' ',' ',' ',' ','#',
  '#',' ','P',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','B',' ',' ',' ','#','#',
  '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#','#','#',
  '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','$',' ','#','#','#','#',
  '#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#',
]

class Level extends TileMap {
  constructor() {
    const tileW = 48;
    const tileH = 48;
    const mapW = 20;
    const mapH = 20;
    const texture = new Texture(tilesImageURL);
    const spawns = {
      player: new Vector(),
      pickups: [],
      totems: [],
      bats: [],
    };

    const tiles = levelMap.map((symbol, index) => {
      const tile = {};
      let spawnX = 0;
      let spawnY = 0;

      switch (symbol) {
        case " ": // walkable tile
          tile.walkable = true;
          tile.x = 1;
          tile.y = 2;
          break;

        case "#": // wall tile
          tile.x = 2;
          tile.y = 3;
          break;

        case "P": // spawn player
          spawnY = Math.floor(index / mapW) * tileW;
          spawnX = (index % mapW) * tileH;
          spawns.player.set(spawnX, spawnY);

          tile.walkable = true;
          tile.x = 1;
          tile.y = 2;
          break;

        case "$": // spawn pickup
          spawnY = Math.floor(index / mapW) * tileW;
          spawnX = (index % mapW) * tileH;
          spawns.pickups.push(new Vector(spawnX, spawnY));

          tile.walkable = true;
          tile.x = 1;
          tile.y = 2;
          break;

        case "T": // spawn totem
          spawnY = Math.floor(index / mapW) * tileW;
          spawnX = (index % mapW) * tileH;
          spawns.totems.push(new Vector(spawnX, spawnY));

          tile.walkable = true;
          tile.x = 1;
          tile.y = 2;
          break;

        case "B": // spawn bat
          spawnY = Math.floor(index / mapW) * tileW;
          spawnX = (index % mapW) * tileH;
          spawns.bats.push(new Vector(spawnX, spawnY));

          tile.walkable = true;
          tile.x = 1;
          tile.y = 2;
          break;

        default:
          // just make a walkable tile
          tile.walkable = true;
          tile.x = 1;
          tile.y = 2;
      }
      return tile;
    });

    for (let y = 1; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        // const index = y * mapW + x;
        // const positionY = Math.floor(index / mapW) * tileW;
        // const positionX = (index % mapW) * tileH;
        const isCurrentWall = !("walkable" in tiles[y * mapW + x]);
        const isAboveWalkable = "walkable" in tiles[(y - 1) * mapW + x];
        if (isCurrentWall && isAboveWalkable) {
          tiles[y * mapW + x].x = 3;
          tiles[y * mapW + x].y = 3;
        }
      }
    }

    super(tiles, mapW, mapH, tileW, tileH, texture);

    this.spawns = spawns;
  }

  findFreeSpot() {
    const { mapW, mapH } = this;
    let x = 0;
    let y = 0;
    let found = false;
    while (!found) {
      x = math.rand(mapW);
      y = math.rand(mapH);
      const { frame } = this.tileAtMapPosition({ x, y });
      if (frame.walkable) {
        found = true;
      }
    }
    return this.mapToPixelPosition({ x, y });
  }
}

export default Level;
