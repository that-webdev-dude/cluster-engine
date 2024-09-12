import * as Cluster from "../../../cluster";
import * as Events from "../events";
import * as Types from "../types";

interface BoundaryOptions {
  behavior: Types.BoundaryBehaviorType;
}

/** Boundary component
 * the boundary component is used to store the boundary type of an entity
 * @tag Boundary
 * @options width, height, behavior
 * @properties width, height, behavior
 */
class BoundaryComponent extends Cluster.Component {
  behavior: Types.BoundaryBehaviorType;

  constructor({ behavior }: BoundaryOptions) {
    super("Boundary");
    this.behavior = behavior;
  }
}

export { BoundaryComponent };