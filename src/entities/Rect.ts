import { Vector, Entity, Components } from "../cluster";

export class Rect extends Entity {
  constructor() {
    super();

    const colour = new Components.Colour({
      fill: "transparent",
      stroke: "blue",
    });
    const visibility = new Components.Visibility({
      opacity: 1,
    });
    const transform = new Components.Transform({
      position: new Vector(0, 0),
      anchor: new Vector(0, 0),
      scale: new Vector(1, 1),
    });
    const size = new Components.Size({
      width: 100,
      height: 100,
    });

    this.attachComponent(colour);
    this.attachComponent(visibility);
    this.attachComponent(transform);
    this.attachComponent(size);
  }
}
