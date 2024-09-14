import * as Cluster from "../../../cluster";

interface ShotgunOptions {
  fireRate: number;
}

/** Alpha component
 * the alpha component is used to store the alpha value of an entity
 * @tag Alpha
 * @options alpha
 * @properties alpha, visible, transparent
 */
class ShotgunComponent extends Cluster.Component {
  fireRate: number;

  constructor({ fireRate }: ShotgunOptions) {
    super("Shotgun");
    this.fireRate = fireRate;
  }
}

export { ShotgunComponent };
