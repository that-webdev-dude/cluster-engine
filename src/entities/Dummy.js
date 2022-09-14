import crashTestImageURL from "../images/crash_test.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";
import Vector from "../cluster/utils/Vector";
import math from "../cluster/utils/math";
import physics from "../cluster/utils/physics";

const MAX_VELOCITY = 560;
const STEER_FORCE = 4800;
const GRAVITY = 4800;
const FRICTION = 2400;

class Dummy extends TileSprite {
  constructor(game, input) {
    super(new Texture(crashTestImageURL), 48, 48);
    const bounds = {
      top: 0,
      right: game.width,
      bottom: game.height,
      left: 0,
    };

    this.input = input;
    this.bounds = bounds;
    this.velocity = new Vector();
    this.acceleration = new Vector();
    this.jumping = false;

    this.init();
  }

  init() {
    const { position, bounds, width, height } = this;
    position.set(width, bounds.bottom - height);
  }

  update(dt, t) {
    // this properties
    // prettier-ignore
    const {
    input,
    position,
    velocity,
    bounds,
    width,
    height
  } = this;

    // on input
    if (input.x != 0 && Math.abs(velocity.x) < MAX_VELOCITY) {
      physics.applyForce(this, { x: input.x * STEER_FORCE, y: 0 }, dt);
    }
    if (input.action && !this.jumping) {
      physics.applyImpulse(this, { x: 0, y: -1200 }, dt);
      this.jumping = true;
    }

    // gravity or friction
    if (this.jumping) {
      physics.applyForce(this, { x: 0, y: GRAVITY });
    } else {
      physics.applyForce(this, velocity.clone().multiply(-1).normalize().multiply(FRICTION));
    }

    // actual move
    let r = physics.integrate(this, dt);
    position.add(r);

    // prevent sliding effect
    if (velocity.magnitude < 10) velocity.set(0, 0);

    // don't go out of bounds
    position.x = math.clamp(position.x, bounds.left, bounds.right - width);
    position.y = math.clamp(position.y, bounds.top, bounds.bottom - height);

    // stop the jumping (like hits down)
    if (position.y === bounds.bottom - height) {
      velocity.y = 0;
      this.jumping = false;
    }
  }
}

export default Dummy;
