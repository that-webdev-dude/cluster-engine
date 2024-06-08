import { Vector, Entity } from "../cluster";
import { Components } from "../cluster/ecs";
import backgroundImageURL from "../images/background.png";

export class Background extends Entity {
  constructor() {
    super();

    const transform = new Components.Transform({
      position: new Vector(0, 0),
    });
    const texture = new Components.Texture({
      imageURL: backgroundImageURL,
    });

    this.attachComponent(transform);
    this.attachComponent(texture);
  }
}
