import tilesImageURL from "../images/tiles_pixel.png";
import TileSprite from "../cluster/core/TileSprite";
import Texture from "../cluster/core/Texture";
import math from "../cluster/utils/math";
import State from "../cluster/core/State";

const states = {
  IDLE: 0,
  CHARGE: 1,
  ATTACK: 2,
};

class Totem extends TileSprite {
  constructor(target, fire) {
    super(new Texture(tilesImageURL), 48, 48);
    this.state = new State(states.IDLE);
    this.frame = { x: 0, y: 1 };
    this.target = target;
    this.fire = fire;
    this.timer = 0;
  }

  update(dt, t) {
    super.update(dt, t);

    let charge = math.randOneIn(150);
    if (charge) {
      this.state.set(states.CHARGE);
      this.timer = 1;
    }

    if (this.timer > 0) {
      this.timer -= dt;
    }

    if (this.timer < 0) {
      this.state.set(states.ATTACK);
      this.timer = 0;
    }

    switch (this.state.get()) {
      case states.IDLE:
        this.frame = { x: 1, y: 1 };
        break;
      case states.CHARGE:
        this.frame = { x: 2, y: 1 };
        break;
      case states.ATTACK:
        this.state.set(states.IDLE);
        this.frame = { x: 0, y: 1 };
        this.fire();
        break;
    }
  }
}

export default Totem;
