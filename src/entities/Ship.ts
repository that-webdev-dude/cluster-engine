import { TileSprite, Vector, Cmath } from "../ares";
import PlayerImageURL from "../images/spritesheet.png";

class Ship extends TileSprite {
  constructor() {
    super({
      textureURL: PlayerImageURL,
      tileW: 32,
      tileH: 32,
      frame: { x: 1, y: 3 },
      angle: Cmath.deg2rad(90),
      pivot: new Vector(16, 16),
    });
  }
}

export default Ship;
