import cluster from "../cluster";
import spritesheetImageURL from "../images/spritesheet.png";
const { TileMap, Container, Texture, TiledParser } = cluster;

// TODO
// how do we handle the texture here?
const texture = new Texture(spritesheetImageURL);

class TiledLevel extends TileMap {
  constructor(tiledData) {
    const { mapW, mapH, tileW, tileH, tiles } =
      TiledParser.parseLevel(tiledData);
    super(tiles, mapW, mapH, tileW, tileH, texture);
  }
}

export default TiledLevel;
