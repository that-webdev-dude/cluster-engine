import { GAME_CONFIG } from "../config/GameConfig";
import { Rect, Vector, Cmath } from "../ares";

class Enemy extends Rect {
  velocity: Vector;

  constructor() {
    super({
      width: 32,
      height: 32,
      fill: "red",
      position: new Vector(
        Cmath.rand(0, GAME_CONFIG.width - 50),
        Cmath.rand(0, GAME_CONFIG.height - 50)
      ),
    });

    let speed = Cmath.rand(150, 300);
    this.velocity = new Vector(speed, speed);
  }

  update(dt: number, t: number): void {
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    if (this.position.x > GAME_CONFIG.width - 50 || this.position.x < 0) {
      this.velocity.x *= -1;
    }
    if (this.position.y > GAME_CONFIG.height - 50 || this.position.y < 0) {
      this.velocity.y *= -1;
    }
  }
}

export default Enemy;
