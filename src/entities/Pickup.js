import tilesImageURL from "../images/tiles.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";

class Pickup extends TileSprite {
  constructor() {
    super(new Texture(tilesImageURL), 48, 48);
    this.frame = { x: 5, y: 2 };
    this.hitbox = {
      x: 0,
      y: 0,
      width: 48,
      height: 48,
    };
  }
}

export default Pickup;
