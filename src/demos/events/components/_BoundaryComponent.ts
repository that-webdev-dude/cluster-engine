import * as Cluster from "../../../cluster";
import * as Types from "../types";

interface BoundaryOptions {
  behavior: Types.BoundaryBehaviorType;
  events?: Types.StoreEvent[];
}

/** Boundary component
 * the boundary component is used to store the boundary type of an entity
 * @tag Boundary
 * @options width, height, behavior
 * @properties width, height, behavior
 */
class BoundaryComponent extends Cluster.Component {
  behavior: Types.BoundaryBehaviorType;
  events?: Types.StoreEvent[];

  constructor({ behavior, events }: BoundaryOptions) {
    super("Boundary");
    this.behavior = behavior;
    this.events = events || [];
  }
}

export { BoundaryComponent };
