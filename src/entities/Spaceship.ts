import { Vector, Entity, Components } from "../cluster";
import spaceshipImageURL from "../images/spaceship.png";

export class Spaceship extends Entity {
  constructor() {
    super();

    const transform = new Components.Transform({
      position: new Vector(100, 100),
    });
    const texture = new Components.Texture({
      imageURL: spaceshipImageURL,
    });
    const speed = new Components.Speed({
      speed: 400,
    });
    const keyboard = new Components.Keyboard();

    this.attachComponent(transform);
    this.attachComponent(texture);
    this.attachComponent(speed);
    this.attachComponent(keyboard);
  }
}
