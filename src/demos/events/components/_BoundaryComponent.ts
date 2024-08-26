import * as Cluster from "../../../cluster";

interface BoundaryOptions {
  boundary: "contain" | "wrap" | "bounce" | "die" | "stop" | "sleep" | "none";
}

/** Boundary component
 * the boundary component is used to store the boundary type of an entity
 * @tag Boundary
 * @options type
 * @properties type
 */
class BoundaryComponent extends Cluster.Component {
  boundary: "contain" | "wrap" | "bounce" | "die" | "stop" | "sleep" | "none";

  constructor({ boundary }: BoundaryOptions) {
    super("Boundary");
    this.boundary = boundary;
  }
}

export { BoundaryComponent };
