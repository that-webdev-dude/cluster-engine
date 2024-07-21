import { Entity, Vector } from "../cluster";
import { Transform } from "../components/Transform";
import { Colour } from "../components/Colour";
import { Collision } from "../components/Collision";
import { Size } from "../components/Size";
import { GameCollisionLayer } from "../store";

export class Floor extends Entity {
  constructor(x: number, y: number) {
    super("Floor");

    const transform = new Transform({
      position: new Vector(x, y),
    });
    const size = new Size({
      width: 32,
      height: 32,
    });
    const colour = new Colour({
      stroke: "black",
      fill: "transparent",
    });
    const collision = new Collision({
      layer: GameCollisionLayer.Wall,
    });

    this.attachComponent(transform);
    this.attachComponent(size);
    this.attachComponent(colour);
    this.attachComponent(collision);
  }
}
