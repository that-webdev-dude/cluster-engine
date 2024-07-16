import { Entity, Vector } from "../cluster";
import { Transform } from "../components/Transform";
import { Velocity } from "../components/Velocity";
import { Colour } from "../components/Colour";
import { Input } from "../components/Input";
import { Size } from "../components/Size";
import { InputMotion } from "../components/motion/InputMotion";
import { VibrationMotion } from "../components/motion/VibrationMotion";

export class Player extends Entity {
  constructor() {
    super("Player");

    const input = new Input(); // can be configurable
    const transform = new Transform({
      position: new Vector(32, 32),
    });
    const velocity = new Velocity({
      value: new Vector(0, 0),
      minSpeed: 10,
      maxSpeed: 200,
    });
    const colour = new Colour({
      fill: "red",
    });
    const size = new Size({
      width: 32,
      height: 32,
    });
    const inputMotion = new InputMotion({
      speedX: 200,
      speedY: 200,
    });

    this.attachComponent(input);
    this.attachComponent(transform);
    this.attachComponent(velocity);
    this.attachComponent(colour);
    this.attachComponent(size);
    this.attachComponent(inputMotion);
  }
}

export class Enemy extends Entity {
  constructor() {
    super("Enemy");

    const transform = new Transform({
      position: new Vector(320, 320),
    });
    const colour = new Colour({
      fill: "blue",
    });
    const size = new Size({
      width: 32,
      height: 32,
    });
    const vibrationMotion = new VibrationMotion({
      offsetX: 2,
      offsetY: 2,
    });

    this.attachComponent(transform);
    this.attachComponent(colour);
    this.attachComponent(size);
    this.attachComponent(vibrationMotion);
  }
}
