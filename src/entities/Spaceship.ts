import { Entities, Components, Vector } from "../cluster";

export class Spaceship extends Entities.Texture {
  constructor() {
    super({
      imageURL: require("../images/spaceship.png"),
    });

    this.attach(new Components.Input());
    this.attach(new Components.Speed(this.id, 400));
  }
}
