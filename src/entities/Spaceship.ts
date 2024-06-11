import { GAME_CONFIG } from "../config/GameConfig";
import { Vector, Entity } from "../cluster";
import { Components } from "../cluster/ecs";
import { Bullet } from "./Bullet";
import spaceshipImageURL from "../images/spaceship.png";

const { width: GAME_WIDTH, height: GAME_HEIGHT } = GAME_CONFIG;

export class Spaceship extends Entity {
  constructor() {
    super();

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
      speed: new Vector(400, 400),
    });
    const status = new Components.Status({
      dead: false,
    });

    const cannon = new Components.Spawner({
      spawnInterval: 0.5,
      spawnCountMax: 2,
      spawnEntity: Bullet,
      spawnPosition: () => {
        const transform = this.getComponent(Components.Transform);
        if (transform) {
          return Vector.from(transform.position).add(new Vector(16, 16));
        } else {
          return new Vector(0, 0);
        }
      },
      spawnTrigger: () => {
        const keyboard = this.getComponent(Components.Keyboard);
        if (keyboard) {
          return keyboard.action;
        } else {
          return false;
        }
      },
    });
    const keyboard = new Components.Keyboard();

    this.attachComponent(transform);
    this.attachComponent(texture);
    this.attachComponent(speed);
    this.attachComponent(screen);
    this.attachComponent(status);
    this.attachComponent(cannon);
    this.attachComponent(keyboard);
  }
}
