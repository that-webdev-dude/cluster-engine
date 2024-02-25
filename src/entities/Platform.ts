import { GAME_CONFIG } from "../config/GameConfig";
import { Vector, Physics, Cmath, Rect } from "../ares";
import PhysicsRect from "./PhysicsRect";

let SPEED = 200;
let FORCE = 100;

class Platform extends Rect {
  physicsType: number; // kinematic
  constructor(position: Vector, width: number, height: number) {
    super({
      position: position,
      size: new Vector(width, height),
      style: {
        fill: "grey",
      },
    });

    this.velocity.set(SPEED, 0);
    this.physicsType = 0;
  }

  update(dt: number, t: number): void {
    Physics.applyForce(this, { x: 1, y: 0 });
    Physics.updateEntity(this, dt);
    if (
      this.position.x <= 0 ||
      this.position.x >= GAME_CONFIG.width - this.width
    ) {
      // console.log((SPEED *= -1));
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
