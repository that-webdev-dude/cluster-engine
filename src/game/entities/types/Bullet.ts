import { CollisionLayers } from "../constants/CollisionLayers";
import * as Cluster from "../../../cluster";
import * as Components from "../../components";
import * as Images from "../../../images";

/** Bullet entity
 * @options position, direction, damage, speed [, frame]
 * @components Transform, Velocity, Sprite, Zindex, Bullet
 */
interface BulletOptions {
  position: Cluster.Vector;
  direction: Cluster.Vector;
  damage: number;
  speed: number;
  frame?: number;
}
export class Bullet extends Cluster.Entity {
  constructor({
    position,
    direction,
    damage,
    speed,
    frame = 0,
  }: BulletOptions) {
    super();

    const transform = new Components.TransformComponent({
      boundary: "sleep",
      position: position,
    });

    const velocity = new Components.VelocityComponent({
      velocity: new Cluster.Vector(direction.x * speed, direction.y * speed),
    });

    const sprite = new Components.SpriteComponent({
      image: Images.bulletsImage,
      frame: frame,
      width: 12,
      height: 12,
    });

    const zindex = new Components.ZindexComponent({
      zindex: 1,
    });

    const bullet = new Components.BulletComponent({
      damage: damage,
      speed: speed,
      direction: direction,
    });

    this.components.set("Transform", transform);
    this.components.set("Velocity", velocity);
    this.components.set("Sprite", sprite);
    this.components.set("Zindex", zindex);
    this.components.set("Bullet", bullet);
  }
}

export const spaceshipBulletPool = new Cluster.Pool<Bullet>(() => {
  const bullet = new Bullet({
    position: new Cluster.Vector(0, 0),
    direction: new Cluster.Vector(1, 0),
    damage: 10,
    speed: 500,
    frame: 0,
  });
  // bullet.components.set(
  //   "Collision",
  //   new Components.CollisionComponent({
  //     layer: CollisionLayers.SpaceshipBullet,
  //     hitbox: {
  //       x: 0,
  //       y: 0,
  //       width: 12,
  //       height: 12,
  //     },
  //     resolvers: [
  //       {
  //         type: "die",
  //         mask: CollisionLayers.Enemy,
  //         actions: [
  //           {
  //             name: "damage",
  //             data: 10,
  //           },
  //         ],
  //       },
  //     ],
  //   })
  // );
  return bullet;
}, 0);

export const enemyBulletPool = new Cluster.Pool<Bullet>(() => {
  const bullet = new Bullet({
    position: new Cluster.Vector(0, 0),
    direction: new Cluster.Vector(-1, 0),
    damage: 10,
    speed: 500,
    frame: 10,
  });
  // bullet.components.set(
  //   "Collision",
  //   new Components.CollisionComponent({
  //     layer: CollisionLayers.EnemyBullet,
  //     hitbox: {
  //       x: 0,
  //       y: 0,
  //       width: 12,
  //       height: 12,
  //     },
  //     resolvers: [
  //       {
  //         type: "die",
  //         mask: CollisionLayers.Spaceship,
  //       },
  //     ],
  //   })
  // );
  return bullet;
}, 0);
