import tilesImageURL from "../images/tiles.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";

class Pickup extends TileSprite {
  constructor() {
    super(new Texture(tilesImageURL), 48, 48);
    this.frame = { x: 5, y: 2 };
  }
}

export default Pickup;
