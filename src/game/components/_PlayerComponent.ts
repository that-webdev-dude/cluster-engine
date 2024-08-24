import * as Cluster from "../../cluster";

interface PlayerOptions {
  lives: number;
  speed: number;
  health: number;
}

/** Player component
 * @tag Player
 * @options lives, speed, health
 * @properties lives, speed, health
 */
class PlayerComponent extends Cluster.Component {
  lives: number;
  speed: number;
  health: number;

  constructor({ lives, speed, health }: PlayerOptions) {
    super("Player");
    this.lives = lives;
    this.speed = speed;
    this.health = health;
  }
}

export { PlayerComponent };
