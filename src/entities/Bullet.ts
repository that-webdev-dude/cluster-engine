import { GAME_CONFIG } from "../config/GameConfig";
import { Vector, Entity } from "../cluster";
import { Components } from "../cluster/ecs";

const {
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  collisionLayer: GAME_COLLISION_LAYER,
} = GAME_CONFIG;

export class Bullet extends Entity {
  constructor() {
    super();

    const transform = new Components.Transform({
      position: new Vector(200, 0),
    });
    const size = new Components.Radius({
      radius: 4,
    });
    const screen = new Components.Screen({
      offscreenBehavior: "die",
      entityHeight: size.radius * 2,
      entityWidth: size.radius * 2,
      height: GAME_HEIGHT,
      width: GAME_WIDTH,
    });
    const speed = new Components.Speed({
      speed: new Vector(800, 0),
    });
    const status = new Components.Status({
      dead: false,
    });
    const hitbox = new Components.Hitbox({
      position: transform.position,
      size: new Vector(size.radius * 2, size.radius * 2),
      exclude: ["Spaceship", "Bullet"],
    });
    const colour = new Components.Colour({
      fill: "red",
      stroke: "transparent",
    });
    const collision = new Components.Collision({
      layer: GAME_COLLISION_LAYER.Bullet,
      mask: GAME_COLLISION_LAYER.Enemy,
    });

    this.attachComponent(transform);
    this.attachComponent(size);
    this.attachComponent(speed);
    this.attachComponent(screen);
    this.attachComponent(status);
    this.attachComponent(hitbox);
    this.attachComponent(colour);
    this.attachComponent(collision);
  }
}

export function createBullet(position: Vector, speed: Vector): Entity {
  const bullet = new Bullet();
  const transformComponent = bullet.getComponent(Components.Transform);
  if (transformComponent) {
    transformComponent.position = position;
  }
  const speedComponent = bullet.getComponent(Components.Speed);
  if (speedComponent) {
    speedComponent.speed = speed;
  }
  const hitboxComponent = bullet.getComponent(Components.Hitbox);
  if (hitboxComponent) {
    hitboxComponent.position = position;
  }
  return bullet;
}

export function createBullets(sourcePosition: Vector): Entity[] {
  const bulletSpeed = new Vector(800, 0);
  const bullets = [];
  for (let i = -1; i < 2; i++) {
    bullets.push(
      createBullet(
        Vector.from(sourcePosition).add(new Vector(38, 16)),
        Vector.from(bulletSpeed).add(new Vector(0, i * 100))
      )
    );
  }
  return bullets;
}
