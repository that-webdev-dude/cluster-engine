import { Entity, Vector } from "../cluster";
import { Transform } from "../components/Transform";
import { Colour } from "../components/Colour";
import { Size } from "../components/Size";
import { store } from "../store";

export class MenuBackground extends Entity {
  constructor() {
    super();

    const transform = new Transform({
      position: new Vector(0, 0),
    });
    const colour = new Colour({
      fill: "black",
    });
    const size = new Size({
      width: store.get("screenWidth"),
      height: store.get("screenHeight"),
    });

    this.attachComponent(transform);
    this.attachComponent(colour);
    this.attachComponent(size);
  }
}

export class GameBackground extends Entity {
  constructor() {
    super();

    const transform = new Transform({
      position: new Vector(0, 0),
    });
    const colour = new Colour({
      fill: "black",
    });
    const size = new Size({
      width: store.get("screenWidth"),
      height: store.get("screenHeight"),
    });

    this.attachComponent(transform);
    this.attachComponent(colour);
    this.attachComponent(size);
  }
}
