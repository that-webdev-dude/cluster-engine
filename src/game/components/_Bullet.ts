import * as Cluster from "../../cluster";

interface BulletOptions {
  damage: number;
  speed: number;
  direction: Cluster.Vector;
}

/** Bullet component
 * the bullet component is used to store the damage, speed and direction of a bullet
 * @tag Bullet
 * @options damage, velocity
 * @properties damage, speed, direction
 */
class BulletComponent extends Cluster.Component {
  damage: number;
  speed: number;
  direction: Cluster.Vector;

  constructor({ damage, speed, direction }: BulletOptions) {
    super("Bullet");
    this.damage = damage;
    this.speed = speed;
    this.direction = Cluster.Vector.from(direction);
  }
}

export { BulletComponent };
