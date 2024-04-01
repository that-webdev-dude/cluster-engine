import { GAME_CONFIG } from "../config/GameConfig";
import { Rect, Vector, World } from "../cluster";

export class Pipe extends Rect {
  scored: boolean = false;
  speed: number = 300;
  constructor(position: Vector, height: number) {
    super({
      position: position,
      width: 100,
      height: height,
      style: {
        fill: "transparent",
        stroke: "white",
      },
      hitbox: {
        x: 0,
        y: 0,
        width: 100,
        height: height,
      },
    });
    this.velocity.x = -this.speed;
  }

  update(dt: number, t: number) {
    if (World.Screen.offscreen(this, GAME_CONFIG.width, GAME_CONFIG.height)) {
      this.dead = true;
    }
  }
}
