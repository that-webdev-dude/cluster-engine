import crashTestImageURL from "../images/crash_test.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";
import Vector from "../cluster/utils/Vector";
import math from "../cluster/utils/math";
import bounce from "../cluster/movement/bounce";
import physics from "../cluster/utils/physics";

const MAX_POWER = 500;

class Dummy extends TileSprite {
  constructor(bounds) {
    super(new Texture(crashTestImageURL), 48, 48);
    let vx = math.rand(-MAX_POWER, MAX_POWER);
    let vy = math.rand(-MAX_POWER, MAX_POWER);
    this.acceleration = new Vector();
    this.velocity = new Vector(vx, vy);
    this.bounds = bounds;
    this.radius = 24;
  }

  update(dt, t) {
    const { position, bounds } = this;
    let d = physics.integrate(this, dt);
    let r = bounce(this, bounds, d.x, d.y);
    position.add(r);
  }
}

export default Dummy;
