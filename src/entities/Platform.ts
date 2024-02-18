import { GAME_CONFIG } from "../config/GameConfig";
import { Vector, Rect } from "../ares";

class Platform extends Rect {
  walkable = false;
  constructor(position: Vector) {
    super({
      width: GAME_CONFIG.width,
      height: 2.5,
      fill: "blue",
      position: new Vector(0, 500),
    });
    this.hitbox = {
      x: position.x,
      y: position.y,
      width: this.width,
      height: this.height,
    };
  }
  get center(): Vector {
    return new Vector(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
  }
  get size(): Vector {
    return new Vector(this.width, this.height);
  }
}

export default Platform;
