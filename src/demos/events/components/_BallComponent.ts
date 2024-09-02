import * as Cluster from "../../../cluster";

interface BallOptions {
  speed: number;
}

/** Ball component
 * the ball component is used to store the ball state
 * @tag Ball
 * @options speed
 * @properties speed
 */
class BallComponent extends Cluster.Component {
  speed: number;

  constructor({ speed }: BallOptions) {
    super("Ball");
    this.speed = speed;
  }
}

export { BallComponent };
