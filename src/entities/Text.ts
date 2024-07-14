import { Entity, Vector } from "../cluster";
import { Components } from "../cluster/ecs";
import { store } from "../store";

export class Text extends Entity {
  constructor(position: Vector, text: string, fill: string, size: number = 24) {
    super();

    const transformComponent = new Components.Transform({
      position,
    });
    const colourComponent = new Components.Colour({
      fill,
    });
    const textComponent = new Components.Text({
      font: `${size}px Arial`,
      align: "center",
      string: text,
    });

    this.attachComponent(transformComponent);
    this.attachComponent(colourComponent);
    this.attachComponent(textComponent);
  }
}
