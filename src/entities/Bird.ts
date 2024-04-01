import { Rect, Vector, World, Keyboard, Sound } from "../cluster";
import JumpSoundURL from "../sounds/Jump.wav";

const JUMP_SOUND = new Sound(JumpSoundURL, { volume: 0.5 });

export class Bird extends Rect {
  keyboard: Keyboard;
  maxSpeed = 1000;
  constructor(keyboard: Keyboard) {
    super({
      position: new Vector(150, 100),
      width: 32,
      height: 32,
      style: {
        fill: "transparent",
        stroke: "white",
      },
    });
    this.keyboard = keyboard;
  }

  update(dt: number, t: number) {
    const { keyboard } = this;
    World.Physics.applyFriction(this);
    World.Physics.applyGravity(this);
    if (keyboard.action) {
      JUMP_SOUND.play();
      World.Physics.applyImpulse(this, { x: 0, y: -1000 }, dt);
      keyboard.active = false;
    }
  }
}
