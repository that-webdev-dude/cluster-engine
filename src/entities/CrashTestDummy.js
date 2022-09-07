import crashTestImageURL from "../images/crash_test.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";
import Vector from "../cluster/utils/Vector";

class CrashTestDummy extends TileSprite {
  constructor(velocity) {
    super(new Texture(crashTestImageURL), 48, 48);
    this.velocity = new Vector(velocity, 0);
  }

  update(dt, t) {
    const { position, velocity } = this;

    position.x += velocity.x * dt;
    position.y += velocity.y * dt;
  }
}

export default CrashTestDummy;
