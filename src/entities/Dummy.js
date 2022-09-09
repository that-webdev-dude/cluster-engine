import crashTestImageURL from "../images/crash_test.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";
import Vector from "../cluster/utils/Vector";
import math from "../cluster/utils/math";

const ACCELERATION = 200;

class Dummy extends TileSprite {
  constructor(bounds) {
    super(new Texture(crashTestImageURL), 48, 48);
    this.acceleration = new Vector();
    this.velocity = new Vector();
    this.bounds = bounds;

    this.init();
  }

  init() {
    const { bounds } = this;
    this.position.set(0, bounds.h / 2);
  }

  update(dt, t) {
    const { position, velocity, acceleration, bounds } = this;
    acceleration.set(ACCELERATION, 0);

    // velocity
    velocity.x += acceleration.x * dt;
    velocity.y += acceleration.y * dt;

    // position
    position.x += velocity.x * dt;
    position.y += velocity.y * dt;

    // bounce on edges
    if (position.x < 0 || position.x > bounds.w - 48) velocity.x *= -1;
    if (position.y < 0 || position.y > bounds.h - 48) velocity.y *= -1;

    acceleration.set(0, 0);
  }
}

export default Dummy;
