import { Vector } from "../tools/Vector";
import { Entity } from "../core/Entity";
import { Cluster } from "../types/cluster.types";

/**
 * implementation of a Circle Entity class
 */
export class Circle
  extends Entity
  implements Cluster.EntityType<Cluster.CircleOptions>
{
  readonly tag = Cluster.EntityTag.CIRCLE; // Discriminant property
  radius: number;
  style: Cluster.ShapeStyle;

  constructor(options: Cluster.CircleOptions) {
    super(Cluster.EntityTag.CIRCLE, options);
    this.radius = options.radius;
    this.style = options.style || {};
  }

  get diameter() {
    return this.radius * 2;
  }

  get width() {
    return this.radius * 2;
  }

  get height() {
    return this.radius * 2;
  }

  get center() {
    return Vector.from(this.position);
  }

  get boundingBox() {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }
}
