import { GAME_CONFIG } from "../config/GameConfig";
import { Vector, Entity, Assets } from "../cluster";
import { Components } from "../cluster/ecs";
import { createBullets } from "./generators/BulletGenerator";
import spaceshipImageURL from "../images/spaceship.png";

Assets.image(spaceshipImageURL);

const {
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  collisionLayer: GAME_COLLISION_LAYER,
} = GAME_CONFIG;

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
      spawnInterval: 0.25,
      spawnTrigger: () => {
        const keyboard = this.getComponent(Components.Keyboard);
        if (keyboard) {
          return keyboard.action;
        } else {
          return false;
        }
      },
      spawnGenerator: () => {
        return createBullets(Vector.from(transform.position));
      },
    });
    const hitbox = new Components.Hitbox({
      position: transform.position,
      size: new Vector(texture.width, texture.height),
    });
    const collision = new Components.Collision({
      layer: GAME_COLLISION_LAYER.Spaceship,
      mask: GAME_COLLISION_LAYER.Enemy,
      resolvers: [
        {
          mask: GAME_COLLISION_LAYER.Enemy,
          type: "die",
          actions: [
            {
              name: "setScene",
              data: "gameTitle",
            },
          ],
        },
      ],
    });
    const keyboard = new Components.Keyboard();

    this.attachComponent(transform);
    this.attachComponent(texture);
    this.attachComponent(speed);
    this.attachComponent(screen);
    this.attachComponent(status);
    this.attachComponent(cannon);
    this.attachComponent(hitbox);
    this.attachComponent(keyboard);
    this.attachComponent(collision);
  }
}
