import { GAME_CONFIG } from "../config/GameConfig";
import { Vector, Entity } from "../cluster";
import { Components } from "../cluster/ecs";
import enemyImageURL from "../images/enemy.png";

const { width: GAME_WIDTH, height: GAME_HEIGHT } = GAME_CONFIG;

export class Enemy extends Entity {
  constructor() {
    super();

    const transform = new Components.Transform({
      position: new Vector(300, 100),
    });
    const texture = new Components.Texture({
      imageURL: enemyImageURL,
    });
    const screen = new Components.Screen({
      offscreenBehavior: "die",
      entityHeight: texture.height,
      entityWidth: texture.width,
      height: GAME_HEIGHT,
      width: GAME_WIDTH,
    });
    const speed = new Components.Speed({
      speed: new Vector(-200, 0),
    });
    const status = new Components.Status({
      dead: false,
    });
    const colour = new Components.Colour({
      fill: "black",
      stroke: "transparent",
    });

    this.attachComponent(transform);
    this.attachComponent(texture);
    this.attachComponent(speed);
    this.attachComponent(screen);
    this.attachComponent(status);
    this.attachComponent(colour);
  }
}
