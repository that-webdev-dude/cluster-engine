import tilesImageURL from "../images/tiles_pixel.png";
import cluster from "../cluster";

const { Texture, TileMap, math } = cluster;
const TILE_INDEXES = [
  {
    id: "empty",
    x: 1,
    y: 2,
    walkable: true,
  },
  {
    id: "wall",
    x: 2,
    y: 2,
  },
  {
    id: "wall_end",
    x: 3,
    y: 2,
  },
];

const getTileIndexById = (id = "") => {
  if (id.length > 0) return TILE_INDEXES.findIndex((tile) => tile.id === id);
  return 0;
};

class Level extends TileMap {
  constructor(width, height) {
    // level setup
    const texture = new Texture(tilesImageURL);
    const tileW = 48;
    const tileH = 48;
    const mapW = width / tileW;
    const mapH = height / tileH;
    // procedural maze generator
    const level = Array(mapW * mapH).fill(0);
    for (let y = 0; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        // if has already a tile block coming from the side walls really
        if (level[y * mapW + x] === getTileIndexById("wall")) {
          continue;
        }
        // if instead is a border tile, put a wall in it
        if (x === 0 || y === 0 || x === mapW - 1 || y === mapH - 1) {
          level[y * mapW + x] = getTileIndexById("wall");
          continue;
        }
        // skip every other inner blocks add side walls
        if (x % 2 || y % 2 || math.randOneIn(4)) {
          continue;
        } else {
          level[y * mapW + x] = getTileIndexById("wall");
          const [xo, yo] = math.randOneFrom([
            [0, -1],
            [1, 0],
            [0, 1],
            [-1, 0],
          ]);
          level[(y + yo) * mapW + (x + xo)] = getTileIndexById("wall");
        }
      }
    }

    // refine pass1: to add end-wall blocks
    for (let y = 0; y < mapH - 1; y++) {
      for (let x = 0; x < mapW; x++) {
        if (level[y * mapW + x] === getTileIndexById("wall")) {
          if (level[(y + 1) * mapW + x] === getTileIndexById("empty")) {
            level[y * mapW + x] = getTileIndexById("wall_end");
          }
        }
      }
    }

    // refine pass2: to add end-wall blocks at the very end
    for (let x = 0; x < mapW; x++) {
      level[(mapH - 1) * mapW + x] = getTileIndexById("wall_end");
    }

    // TileMap initialize
    super(
      level.map((i) => TILE_INDEXES[i]),
      mapW,
      mapH,
      tileW,
      tileH,
      texture
    );
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
