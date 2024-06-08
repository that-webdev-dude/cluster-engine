import { GAME_CONFIG } from "../config/GameConfig";
import { Vector, Entity } from "../cluster";
import { Components } from "../cluster/ecs";
import spaceshipImageURL from "../images/spaceship.png";

const { width: GAME_WIDTH, height: GAME_HEIGHT } = GAME_CONFIG;
const transform = new Components.Transform({
  position: new Vector(100, 100),
});
const texture = new Components.Texture({
  imageURL: spaceshipImageURL,
});
const screen = new Components.Screen({
  offscreenBehavior: "contain",
  entityHeight: texture.height,
  entityWidth: texture.width,
  height: GAME_HEIGHT,
  width: GAME_WIDTH,
});
const speed = new Components.Speed({
  speed: 400,
});
const status = new Components.Status({
  dead: false,
});
const keyboard = new Components.Keyboard();

export class Spaceship extends Entity {
  constructor() {
    super();

    this.attachComponent(transform);
    this.attachComponent(texture);
    this.attachComponent(speed);
    this.attachComponent(screen);
    this.attachComponent(status);
    this.attachComponent(keyboard);
  }
}
