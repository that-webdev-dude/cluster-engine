import Animation from "./Animation";
import Sprite from "./Sprite";

class TileSprite extends Sprite {
  constructor(texture, tileW, tileH) {
    super(texture);
    this.tileW = tileW;
    this.tileH = tileH;
    this.frame = { x: 0, y: 0 };
    this.animation = new Animation(this);
  }

  get width() {
    return this.tileW;
  }

  get height() {
    return this.tileH;
  }

  update(dt) {
    this.animation.update(dt);
  }
}

export default TileSprite;
