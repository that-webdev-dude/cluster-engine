import * as Cluster from "../../../cluster";

interface ZZZOptions {}

/** ZZZ component
 * the zindex component is used to store the rendering order of an entity
 * @tag Zindex
 * @options zindex
 * @properties zindex
 */
class ZZZComponent extends Cluster.Component {
  constructor({}: ZZZOptions) {
    super("ZZZ");
  }
}

export { ZZZComponent };
