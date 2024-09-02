import * as Cluster from "../../../cluster";

interface BoundaryOptions {
  behavior: "contain" | "wrap" | "bounce" | "die" | "stop" | "sleep" | "none";
}

/** Boundary component
 * the boundary component is used to store the boundary type of an entity
 * @tag Boundary
 * @options width, height, behavior
 * @properties width, height, behavior
 */
class BoundaryComponent extends Cluster.Component {
  behavior: "contain" | "wrap" | "bounce" | "die" | "stop" | "sleep" | "none";

  constructor({ behavior }: BoundaryOptions) {
    super("Boundary");
    this.behavior = behavior;
  }
}

export { BoundaryComponent };
