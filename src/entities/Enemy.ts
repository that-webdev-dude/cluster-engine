import { GAME_CONFIG } from "../config/GameConfig";
import { Vector, Entity, Assets } from "../cluster";
import { Components } from "../cluster/ecs";
import enemyImageURL from "../images/enemy.png";

Assets.image(enemyImageURL);

const {
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  collisionLayer: GAME_COLLISION_LAYER,
} = GAME_CONFIG;

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
    const hitbox = new Components.Hitbox({
      position: transform.position,
      size: new Vector(texture.width, texture.height),
      exclude: ["Enemy"],
    });
    const colour = new Components.Colour({
      fill: "black",
      stroke: "transparent",
    });
    const collision = new Components.Collision({
      layer: GAME_COLLISION_LAYER.Enemy,
      mask: GAME_COLLISION_LAYER.Bullet | GAME_COLLISION_LAYER.Spaceship,
      resolvers: [
        {
          mask: GAME_COLLISION_LAYER.Bullet,
          type: "die",
          actions: [
            {
              name: "increaseScores",
              data: 1,
            },
          ],
        },
      ],
    });

    this.attachComponent(transform);
    this.attachComponent(texture);
    this.attachComponent(speed);
    this.attachComponent(screen);
    this.attachComponent(status);
    this.attachComponent(hitbox);
    this.attachComponent(colour);
    this.attachComponent(collision);
  }
}
