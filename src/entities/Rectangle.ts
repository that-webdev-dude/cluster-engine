import { Entity, Vector } from "../cluster";
import { Transform, Size, Colour, Renderer } from "../components";
import { store } from "../store";

export class Background extends Entity {
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

export class Tile extends Entity {
  constructor(x: number, y: number) {
    super();

    const transform = new Transform({
      position: new Vector(x, y),
    });
    const colour = new Colour({
      fill: "transparent",
      stroke: "white",
    });
    const size = new Size({
      width: 32,
      height: 32,
    });
    const renderer = new Renderer({
      layer: 0,
    });

    this.attachComponent(transform);
    this.attachComponent(colour);
    this.attachComponent(size);
    this.attachComponent(renderer);
  }
}

export class Player extends Entity {
  constructor() {
    super();

    const transform = new Transform({
      position: new Vector(100, 100),
    });
    const colour = new Colour({
      fill: "red",
    });
    const size = new Size({
      width: 32,
      height: 32,
    });
    const renderer = new Renderer({
      layer: 1,
    });

    this.attachComponent(transform);
    this.attachComponent(colour);
    this.attachComponent(size);
    this.attachComponent(renderer);
  }
}
