import { Rect, Vector, World, Keyboard } from "../cluster";

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
    World.applyFriction(this);
    World.applyGravity(this);
    if (keyboard.action) {
      World.applyImpulse(this, { x: 0, y: -1000 }, dt);
      keyboard.active = false;
    }
  }
}
