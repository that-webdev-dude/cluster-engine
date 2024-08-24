import * as Cluster from "../../cluster";

interface EnemyOptions {
  health: number;
  speed: number;
  damage: number;
}

/** Enemy component
 * @tag Enemy
 * @options health, speed, damage
 * @properties health, speed, damage
 */
class EnemyComponent extends Cluster.Component {
  health: number;
  speed: number;
  damage: number;

  constructor({ health, speed, damage }: EnemyOptions) {
    super("Enemy");
    this.health = health;
    this.speed = speed;
    this.damage = damage;
  }
}

export { EnemyComponent };
