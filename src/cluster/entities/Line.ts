import { Vector } from "../tools/Vector";
import { Entity } from "../core/Entity";
import { Cluster } from "../types/cluster.types";

// implementation of a Line Entity class
export class Line
  extends Entity
  implements Cluster.EntityType<Cluster.LineOptions>
{
  readonly tag = Cluster.EntityTag.LINE; // Discriminant property
  start: Vector;
  end: Vector;
  style: Cluster.LineStyle;
  constructor(options: Cluster.LineOptions) {
    super(Cluster.EntityTag.LINE, options);
    this.start = options.start;
    this.end = options.end;
    this.style = options.style || {};
  }

  get length() {
    return Vector.distanceBetween(this.start, this.end);
  }

  get width() {
    return Math.abs(this.end.x - this.start.x);
  }

  get height() {
    return Math.abs(this.end.y - this.start.y);
  }

  get center() {
    return Vector.from(this.start).add(this.end).scale(0.5);
  }

  get boundingBox() {
    return {
      x: Math.min(this.start.x, this.end.x),
      y: Math.min(this.start.y, this.end.y),
      width: this.width,
      height: this.height,
    };
  }
}
