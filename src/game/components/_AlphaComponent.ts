import * as Cluster from "../../cluster";

interface AlphaOptions {
  alpha: number;
}

/** Alpha component
 * the alpha component is used to store the alpha value of an entity
 * @tag Alpha
 * @options alpha
 * @properties alpha, visible, transparent
 */
class AlphaComponent extends Cluster.Component {
  alpha: number;

  constructor({ alpha }: AlphaOptions) {
    super("Alpha");
    this.alpha = alpha;
  }

  get visible() {
    return this.alpha > 0;
  }

  get transparent() {
    return this.alpha < 1;
  }
}

export { AlphaComponent };
