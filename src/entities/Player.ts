import { GAME_CONFIG } from "../config/GameConfig";
import { Rect, Vector, Keyboard, Gamepad, Cmath, Physics } from "../ares";

class Player extends Rect {
  keyboard: Keyboard;
  gamepad: Gamepad;
  speed: number;
  velocity: Vector;
  acceleration: Vector;
  currentPosition: Vector;
  mass: number;

  constructor(keyboard: Keyboard, gamepad: Gamepad) {
    super({
      width: 32,
      height: 32,
      fill: "grey",
      position: new Vector(100, 100),
    });

    this.keyboard = keyboard;
    this.gamepad = gamepad;
    this.speed = 5;

    this.velocity = new Vector(0, 0);
    this.acceleration = new Vector(0, 0);
    this.currentPosition = this.position.clone();
    this.mass = 0.5;
  }

  update(dt: number, t: number): void {
    const { keyboard } = this;
    // accept keyboard input
    if (keyboard.x || keyboard.y) {
      Physics.applyForce(this, { x: keyboard.x * 2, y: keyboard.y * 2 });
    }
    Physics.applyFriction(this, 0.5);
    Physics.reposition(this);
    if (this.velocity.magnitude < 0.5) this.velocity.set(0, 0);

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
