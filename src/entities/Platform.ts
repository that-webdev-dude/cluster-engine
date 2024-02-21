import { GAME_CONFIG } from "../config/GameConfig";
import { Vector, Physics, Cmath } from "../ares";
import PhysicsRect from "./PhysicsRect";

const SPEED = 200;

class Platform extends PhysicsRect {
  constructor(position: Vector, width: number, height: number) {
    super({
      physicsType: 0, // kinematic
      position: position,
      height: height,
      width: width,
      fill: "grey",
    });

    this.velocity.set(SPEED, 0);
  }

  update(dt: number, t: number): void {
    Physics.applyForce(this, { x: 1, y: 0 });
    Physics.updateEntity(this, dt);

    if (
      this.position.x <= 0 ||
      this.position.x >= GAME_CONFIG.width - this.width
    ) {
      this.velocity.x = -this.velocity.x;
      this.position.x = Cmath.clamp(
        this.position.x,
        0,
        GAME_CONFIG.width - this.width
      );
    }
  }
}

export default Platform;
