import { GAME_CONFIG } from "../config/GameConfig";
import { Vector, Rect } from "../ares";

class Platform extends Rect {
  constructor(position: Vector, size: Vector) {
    super({
      width: size.x,
      height: size.y,
      fill: "blue",
      position: position,
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
