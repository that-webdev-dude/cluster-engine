import * as Cluster from "../../../cluster";

interface PlayerOptions {
  invincible: boolean;
}

/** Player component
 * the player component is used to store the player state
 * @tag Player
 * @options invincible
 * @properties invincible
 */
class PlayerComponent extends Cluster.Component {
  invincible: boolean;

  constructor({ invincible }: PlayerOptions) {
    super("Player");
    this.invincible = invincible;
  }
}

export { PlayerComponent };
