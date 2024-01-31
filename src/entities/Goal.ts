import { GAME_CONFIG } from "../config/GameConfig";
import { Rect, Vector, Cmath } from "../ares";

class Goal extends Rect {
  angularSpeed: number;

  constructor() {
    super({
      width: 32,
      height: 32,
      fill: "lightBlue",
      position: new Vector(
        Cmath.rand(0, GAME_CONFIG.width - 50),
        Cmath.rand(0, GAME_CONFIG.height - 50)
      ),
      pivot: new Vector(16, 16),
    });

    this.angularSpeed = 200; /* 2 degrees per second */
  }

  update(dt: number, t: number): void {
    this.angle += Cmath.deg2rad(this.angularSpeed) * dt;
  }
}

export default Goal;
