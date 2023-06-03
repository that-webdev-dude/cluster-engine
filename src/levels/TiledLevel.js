import cluster from "../cluster";
import spritesheetImageURL from "../images/spritesheet.png";
const { TileMap, Container, Texture, tiledParser } = cluster;

// this is the tileset texture
// loaded externally
const texture = new Texture(spritesheetImageURL);

// here's the actual TiledLevel
// class definition
class TiledLevel extends Container {
  constructor(levelData) {
    // parse tiled level
    // -----------------
    const {
      tileheight: tileH,
      tilewidth: tileW,
      height: mapH,
      width: mapW,
      layers,
      tilesets,
    } = levelData;
    // -----------------
    // parse tiled level
  }
}

export default TiledLevel;
