import { Entity, Vector, Keyboard } from "../cluster";
import { Boundary } from "../components/Boundary";
import { Transform } from "../components/Transform";
import { Velocity } from "../components/Velocity";
import { Colour } from "../components/Colour";
import { Input } from "../components/Input";
import { Size } from "../components/Size";
import { Hitbox } from "../components/Hitbox";
import { Physics } from "../components/Physics";
import { Collision } from "../components/Collision";
// import { InputMotion } from "../components/motion/InputMotion";
import { VibrationMotion } from "../components/motion/VibrationMotion";
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
      maxSpeed: 400,
    });
    const colour = new Colour({
      fill: "transparent",
      stroke: "white",
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
      resolvers: [
        {
          mask: GameCollisionLayer.Wall | GameCollisionLayer.Enemy,
          type: "slide",
          actions: [
            {
              name: "dummy",
              data: 1,
            },
          ],
        },
      ],
    });
    const physics = new Physics({
      mass: 1,
      generators: [
        () => {
          let x = 2000 * Keyboard.x();
          let y = 2000 * Keyboard.y();
          return { x, y };
        },
        () => {
          return { x: 0, y: 1000 };
        },
      ],
      // forces: [
      //   { inputKey: "up", force: { x: 0, y: -2000 } },
      //   { inputKey: "down", force: { x: 0, y: 2000 } },
      //   { inputKey: "left", force: { x: -2000, y: 0 } },
      //   { inputKey: "right", force: { x: 2000, y: 0 } },
      //   { force: { x: 0, y: 1000 } },
      // ],
      // impulses: [{ inputKey: "action", force: { x: 0, y: -1000 } }],
    });

    this.attachComponent(boundary);
    this.attachComponent(transform);
    this.attachComponent(velocity);
    this.attachComponent(colour);
    this.attachComponent(size);
    this.attachComponent(input);
    this.attachComponent(hitbox);
    this.attachComponent(physics);
    this.attachComponent(collision);
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
      fill: "white",
    });
    const size = new Size({
      width: 32,
      height: 216,
    });
    const hitbox = new Hitbox({
      x: 0,
      y: 0,
      width: 32,
      height: 216,
      anchor: transform.position,
    });
    const collision = new Collision({
      layer: GameCollisionLayer.Enemy,
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
