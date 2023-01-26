import charactersImageURL from "../images/characters.png";
import cluster from "../cluster";

const { TileMap, Texture, math } = cluster;
const TILE_INDEXES = [
  {
    walkable: false,
    name: "block",
    id: 0,
    x: 0,
    y: 4,
  },
  {
    walkable: false,
    name: "block",
    id: 1,
    x: 1,
    y: 4,
  },
  {
    walkable: false,
    name: "block",
    id: 2,
    x: 2,
    y: 4,
  },
  {
    walkable: true,
    name: "sky",
    id: 3,
    x: 0,
    y: 5,
  },
];

class Level extends TileMap {
  constructor(width, height) {
    // level config
    const texture = new Texture(charactersImageURL);
    const tileSize = 32;
    const mapW = (width || 832) / tileSize;
    const mapH = (height || 640) / tileSize;

    // level generator
    const tiles = [];
    for (let row = 0; row < mapH; row++) {
      for (let col = 0; col < mapW; col++) {
        if (row === mapH - 3) {
          tiles[row * mapW + col] = TILE_INDEXES[math.rand(0, 3)];
        } else {
          tiles[row * mapW + col] = TILE_INDEXES[3];
        }
      }
    }

    super(tiles, mapW, mapH, tileSize, tileSize, texture);
  }
}

export default Level;
