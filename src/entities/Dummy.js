import crashTestImageURL from "../images/crash_test.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";
import Vector from "../cluster/utils/Vector";
import math from "../cluster/utils/math";
import physics from "../cluster/utils/physics";

class Dummy extends TileSprite {
  constructor(bounds, onBounce = () => {}) {
    super(new Texture(crashTestImageURL), 48, 48);
    this.acceleration = new Vector();
    this.velocity = new Vector();
    this.bounds = bounds;
    this.time = 0;
    this.onBounce = onBounce;

    // init
    this.position.set(0, bounds.h / 2);
  }

  update(dt, t) {
    const { position, velocity, bounds } = this;
    if (this.time === 0) {
      physics.applyImpulse(this, { x: 0, y: -1000 }, dt);
    }
    physics.applyForce(this, { x: 0, y: 5000 });
    physics.integrate(this, dt);

    // bounce on edges
    if (position.y < 0 || position.y > bounds.h - 48) velocity.y *= -1;
    if (position.x < 0 || position.x > bounds.w) {
      velocity.x *= -1;
      this.onBounce(this.time);
    }

    this.time += dt;
  }
}

export default Dummy;
