import { Vector, Entity, Components } from "../cluster";

export class Circle extends Entity {
  constructor() {
    super();

    const colour = new Components.Colour({
      fill: "transparent",
      stroke: "red",
    });
    const visibility = new Components.Visibility({
      opacity: 1,
    });
    const transform = new Components.Transform({
      position: new Vector(100, 100),
      anchor: new Vector(0, 0),
      scale: new Vector(1, 1),
    });
    const radius = new Components.Radius({
      radius: 50,
    });

    this.attachComponent(colour);
    this.attachComponent(visibility);
    this.attachComponent(transform);
    this.attachComponent(radius);
  }
}
