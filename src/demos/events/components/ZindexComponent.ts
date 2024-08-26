import * as Cluster from "../../../cluster";

interface ZindexOptions {
  zindex: number;
}

/** Zindex component
 * the zindex component is used to store the rendering order of an entity
 * @tag Zindex
 * @options zindex
 * @properties zindex
 */
class ZindexComponent extends Cluster.Component {
  zindex: number;

  constructor({ zindex }: ZindexOptions) {
    super("Zindex");
    this.zindex = zindex;
  }
}

export { ZindexComponent };
