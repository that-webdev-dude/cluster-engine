import * as Cluster from "../../../cluster";

interface VelocityOptions {
  velocity: Cluster.Vector;
}

/** Velocity component
 * the velocity component is used to store the velocity of an entity
 * @tag Velocity
 * @options velocity
 * @properties direction, velocity, magnitude
 */
class VelocityComponent extends Cluster.Component {
  velocity: Cluster.Vector;

  constructor({ velocity }: VelocityOptions) {
    super("Velocity");
    this.velocity = Cluster.Vector.from(velocity);
  }

  get direction() {
    return Cluster.Vector.normalize(this.velocity);
  }

  get magnitude() {
    return this.velocity.magnitude;
  }
}

export { VelocityComponent };
