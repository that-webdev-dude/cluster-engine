import baddieImageURL from "../images/baddie.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";

class Baddie extends TileSprite {
  constructor(xSpeed, ySpeed) {
    const texture = new Texture(baddieImageURL);

    super(texture, 32, 32);
    this.xSpeed = xSpeed || 0;
    this.ySpeed = ySpeed || 0;
  }
}

export default Baddie;
