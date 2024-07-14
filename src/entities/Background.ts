import { Entity, Vector } from "../cluster";
import { Components } from "../cluster/ecs";
import { store } from "../store";

export class Background extends Entity {
  constructor(fill: string) {
    super();

    const transform = new Components.Transform({
      position: new Vector(),
    });
    const colour = new Components.Colour({
      fill,
    });
    const size = new Components.Size({
      width: store.get("screenWidth"),
      height: store.get("screenHeight"),
    });

    this.attachComponent(transform);
    this.attachComponent(colour);
    this.attachComponent(size);
  }
}
