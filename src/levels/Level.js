import tilesImageURL from "../images/tiles.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";
import TileMap from "../cluster/core/TileMap";

// prettier-ignore
const levelMap = [
  '#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#',
  '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
  '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
  '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
  '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
  '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
  '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
  '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
  '#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',
  '#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#','#',
]

class Level extends TileMap {
  constructor(game) {
    const tileW = 48;
    const tileH = 48;
    const mapW = game.width / tileW + 0;
    const mapH = game.height / tileH + 0;
    const texture = new Texture(tilesImageURL);

    const tiles = levelMap.map((symbol, index) => {
      // const positionY = Math.floor(index / mapW) * tileW;
      // const positionX = (index % mapW) * tileH;
      const tile = {};
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
      }
      return tile;
    });

    for (let y = 1; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        const index = y * mapW + x;
        const isWall = !("walkable" in tiles[y * mapW + x]);
        if (isWall && "walkable" in tiles[(y - 1) * mapW + x]) {
          tiles[y * mapW + x].x = 3;
          tiles[y * mapW + x].y = 3;
        }
      }
    }

    super(tiles, mapW, mapH, tileW, tileH, texture);
  }
}

export default Level;
