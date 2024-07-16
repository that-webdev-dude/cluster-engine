import { Entity, Vector } from "../cluster";
import { Transform } from "../components/Transform";
import { Velocity } from "../components/Velocity";
import { Colour } from "../components/Colour";
import { Input } from "../components/Input";
import { Size } from "../components/Size";
import { store } from "../store";

export class Player extends Entity {
  constructor() {
    super("Player");

    const transform = new Transform({
      position: new Vector(32, 32),
    });
    const velocity = new Velocity({
      value: new Vector(200, 0),
    });
    const colour = new Colour({
      fill: "red",
    });
    const size = new Size({
      width: 32,
      height: 32,
    });
    const input = new Input();

    this.attachComponent(transform);
    this.attachComponent(velocity);
    this.attachComponent(colour);
    this.attachComponent(size);
    this.attachComponent(input);
  }
}

export class Enemy extends Entity {
  constructor() {
    super("Enemy");

    const transform = new Transform({
      position: new Vector(128, 128),
    });
    const colour = new Colour({
      fill: "blue",
    });
    const size = new Size({
      width: 32,
      height: 32,
    });

    this.attachComponent(transform);
    this.attachComponent(colour);
    this.attachComponent(size);
  }
}
