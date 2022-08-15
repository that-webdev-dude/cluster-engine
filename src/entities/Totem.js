import tilesImageURL from "../images/tiles.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";
import math from "../cluster/utils/math";

class Totem extends TileSprite {
  constructor(target, onFire) {
    super(new Texture(tilesImageURL), 48, 48);
    this.target = target;
    this.onFire = onFire;
    this.frame = { x: 0, y: 1 };
    this.animation.add(
      "blink",
      [
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ],
      0.1
    );
    this.animation.play("blink");
  }

  update(dt, t) {
    super.update(dt, t);
    let fireNow = math.randOneIn(250);
    if (fireNow) {
      this.onFire();
    }
  }
}

export default Totem;
