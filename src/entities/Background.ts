import { Entities, Vector } from "../cluster";

export class Background extends Entities.Texture {
  constructor() {
    super({
      imageURL: require("../images/background.png"),
      // position: new Vector(0, 0),
    });
  }
}
