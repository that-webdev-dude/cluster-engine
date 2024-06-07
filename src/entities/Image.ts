import { Vector, Entity, Components } from "../cluster";

export class Image extends Entity {
  constructor(imageURL: string) {
    super();

    const visibility = new Components.Visibility({
      opacity: 1,
    });
    const transform = new Components.Transform({
      position: new Vector(0, 0),
      anchor: new Vector(0, 0),
      scale: new Vector(1, 1),
    });
    const texture = new Components.Texture({
      imageURL,
    });

    this.attachComponent(visibility);
    this.attachComponent(transform);
    this.attachComponent(texture);
  }
}
