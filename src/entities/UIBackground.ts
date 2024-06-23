import { GAME_CONFIG } from "../config/GameConfig";
import { Vector, Entity, Assets } from "../cluster";
import { Components } from "../cluster/ecs";
import backgroundImageURL from "../images/background.png";

Assets.image(backgroundImageURL);

export class TitleBackground extends Entity {
  constructor() {
    super();

    const transform = new Components.Transform({
      position: new Vector(0, 0),
    });
    const size = new Components.Size({
      width: GAME_CONFIG.width,
      height: GAME_CONFIG.height,
    });
    const colour = new Components.Colour({
      fill: "black",
    });

    this.attachComponent(transform);
    this.attachComponent(colour);
    this.attachComponent(size);
  }
}

export class GameBackground extends Entity {
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
