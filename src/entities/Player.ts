import { GAME_CONFIG } from "../config/GameConfig";
import { Rect, Vector, Keyboard, Gamepad, Cmath } from "../ares";

class Player extends Rect {
  keyboard: Keyboard;
  gamepad: Gamepad;
  speed: number;

  constructor(keyboard: Keyboard, gamepad: Gamepad) {
    super({
      width: 32,
      height: 32,
      fill: "grey",
      position: new Vector(100, 100),
    });

    this.keyboard = keyboard;
    this.gamepad = gamepad;
    this.speed = 200;
  }

  update(dt: number, t: number): void {
    const { keyboard } = this;
    // accept keyboard input
    if (keyboard.x) {
      this.position.x += keyboard.x * this.speed * dt;
    }
    if (keyboard.y) {
      this.position.y += keyboard.y * this.speed * dt;
    }
    // clamp player position in the world
    this.position.x = Cmath.clamp(
      this.position.x,
      0,
      GAME_CONFIG.width - this.width
    );
    this.position.y = Cmath.clamp(
      this.position.y,
      0,
      GAME_CONFIG.height - this.height
    );
  }
}

export default Player;
