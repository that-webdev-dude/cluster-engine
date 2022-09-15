import crashTestImageURL from "../images/crash_test.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";
import Vector from "../cluster/utils/Vector";
import math from "../cluster/utils/math";
import bounce from "../cluster/movement/bounce";
import physics from "../cluster/utils/physics";

const MAX_POWER = 500;

class Dummy extends TileSprite {
  constructor(game, input) {
    super(new Texture(crashTestImageURL), 48, 48);
    const bounds = {
      top: 0,
      right: game.width - 48,
      bottom: game.height - 48,
      left: 0,
    };

    this.input = input;
    this.bounds = bounds;
    this.acceleration = new Vector();
    this.velocity = new Vector(math.rand(-MAX_POWER, MAX_POWER), math.rand(-MAX_POWER, MAX_POWER));
  }

  update(dt, t) {
    // this properties
    // prettier-ignore
    const {
    input,
    position,
    velocity,
    bounds,
  } = this;

    let d = physics.integrate(this, dt);

    let r = bounce(this, bounds, d.x, d.y);

    position.add(r);
  }
}

export default Dummy;
