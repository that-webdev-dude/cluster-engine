import { GAME_CONFIG } from "../config/GameConfig";
import { Cmath, Vector, Entity, Assets } from "../cluster";
import { Components } from "../cluster/ecs";
import enemyImageURL from "../images/enemy.png";

const { width: GAME_WIDTH, height: GAME_HEIGHT } = GAME_CONFIG;
Assets.image(enemyImageURL);

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

    this.attachComponent(transform);
    this.attachComponent(texture);
    this.attachComponent(speed);
    this.attachComponent(screen);
    this.attachComponent(status);
    this.attachComponent(hitbox);
    this.attachComponent(colour);
  }
}

export function createEnemy(): Entity {
  const enemy = new Enemy();
  const transformComponent = enemy.getComponent(Components.Transform);
  if (transformComponent) {
    transformComponent.position.x = GAME_WIDTH - 32;
    transformComponent.position.y = Cmath.rand(0, GAME_HEIGHT - 32);
  }
  const speedComponent = enemy.getComponent(Components.Speed);
  if (speedComponent) {
    speedComponent.speed.x = Cmath.rand(-150, -50);
    speedComponent.speed.y = 0;
  }
  return enemy;
}
