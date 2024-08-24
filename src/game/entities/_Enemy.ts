import { CollisionLayers } from "./constants/CollisionLayers";
import { enemyBulletPool } from "./_Bullet";
import * as Images from "../../images";
import * as Cluster from "../../cluster";
import * as Components from "../components";

/** Enemy entity
 * @options position, velocity
 * @components Health, Transform, Velocity, Texture, Zindex, Spawner
 */
interface EnemyOptions {
  position: Cluster.Vector;
}
export class Enemy extends Cluster.Entity {
  constructor({ position }: EnemyOptions) {
    super();

    const transform = new Components.TransformComponent({
      boundary: "sleep",
      position: position,
    });

    const velocity = new Components.VelocityComponent({
      velocity: new Cluster.Vector(-100, 0),
    });

    const sprite = new Components.SpriteComponent({
      image: Images.enemiesImage,
      frame: 27,
      width: 64,
      height: 64,
    });

    const zindex = new Components.ZindexComponent({
      zindex: 1,
    });

    const enemy = new Components.EnemyComponent({
      health: 100,
      speed: 100,
      damage: 10,
    });

    const spawner = new Components.SpawnerComponent({
      strategy: "bullet",
      pool: enemyBulletPool,
      limit: 0,
      interval: 3,
    });

    const collision = new Components.CollisionComponent({
      layer: CollisionLayers.Enemy,
      mask: CollisionLayers.SpaceshipBullet | CollisionLayers.Spaceship,
      hitbox: {
        x: 0,
        y: 0,
        width: 64,
        height: 64,
      },
      resolvers: [
        {
          type: "sleep",
          mask: CollisionLayers.SpaceshipBullet | CollisionLayers.Spaceship,
          actions: [
            {
              action: "addScores",
              payload: 5,
            },
          ],
        },
      ],
    });

    this.components.set("Transform", transform);
    this.components.set("Velocity", velocity);
    this.components.set("Sprite", sprite);
    this.components.set("Zindex", zindex);
    this.components.set("Enemy", enemy);
    this.components.set("Spawner", spawner);
    this.components.set("Collision", collision);
  }
}

export const enemyPool = new Cluster.Pool<Enemy>(() => {
  return new Enemy({
    position: new Cluster.Vector(0, 0),
  });
}, 0);
