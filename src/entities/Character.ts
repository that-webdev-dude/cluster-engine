import { Entity, Vector } from "../cluster";
import { Boundary } from "../components/Boundary";
import { Transform } from "../components/Transform";
import { Velocity } from "../components/Velocity";
import { Colour } from "../components/Colour";
import { Input } from "../components/Input";
import { Size } from "../components/Size";
import { Hitbox } from "../components/Hitbox";
import { InputMotion } from "../components/motion/InputMotion";
import { VibrationMotion } from "../components/motion/VibrationMotion";
import { Collision } from "../components/Collision";
import { store, GameCollisionLayer } from "../store";

export class Player extends Entity {
  constructor() {
    super("Player");

    const boundary = new Boundary({
      width: store.get("screenWidth"),
      height: store.get("screenHeight"),
      behavior: "stop",
    });
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
    const input = new Input({
      action: "Space",
      pause: "KeyP",
      quit: "Escape",
      enter: "Enter",
      right: "KeyD",
      down: "KeyS",
      left: "KeyA",
      up: "KeyW",
    });
    const hitbox = new Hitbox({
      x: 0,
      y: 0,
      width: 32,
      height: 32,
      anchor: transform.position,
    });
    const collision = new Collision({
      layer: GameCollisionLayer.Player,
      mask: GameCollisionLayer.Enemy,
    });
    const inputMotion = new InputMotion({
      speedX: 200,
      speedY: 200,
    });

    this.attachComponent(boundary);
    this.attachComponent(transform);
    this.attachComponent(velocity);
    this.attachComponent(colour);
    this.attachComponent(size);
    this.attachComponent(input);
    this.attachComponent(hitbox);
    this.attachComponent(collision);
    this.attachComponent(inputMotion);
  }
}

export class Enemy extends Entity {
  constructor() {
    super("Enemy");

    const boundary = new Boundary({
      width: store.get("screenWidth"),
      height: store.get("screenHeight"),
      behavior: "wrap",
    });
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
    const hitbox = new Hitbox({
      x: 0,
      y: 0,
      width: 32,
      height: 32,
      anchor: transform.position,
    });
    const collision = new Collision({
      layer: GameCollisionLayer.Enemy,
      mask: GameCollisionLayer.Player,
    });
    const vibrationMotion = new VibrationMotion({
      offsetX: 4,
      offsetY: 0,
    });

    this.attachComponent(transform);
    this.attachComponent(colour);
    this.attachComponent(size);
    this.attachComponent(boundary);
    this.attachComponent(hitbox);
    this.attachComponent(collision);
    this.attachComponent(vibrationMotion);
  }
}
