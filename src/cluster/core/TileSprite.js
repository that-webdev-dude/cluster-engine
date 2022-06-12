import Sprite from "./Sprite";

class TileSprite extends Sprite {
  constructor(texture, tileW, tileH) {
    super(texture);
    this.tileW = tileW;
    this.tileH = tileH;
    this.frame = { x: 0, y: 0 };
  }
}

export default TileSprite;
