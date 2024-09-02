import * as Cluster from "../../../cluster";

interface PlayerOptions {
  speed: number;
}

/** Player component
 * the player component is used to store the player state
 * @tag Player
 * @options speed
 * @properties speed
 */
class PlayerComponent extends Cluster.Component {
  speed: number;

  constructor({ speed }: PlayerOptions) {
    super("Player");
    this.speed = speed;
  }
}

export { PlayerComponent };
