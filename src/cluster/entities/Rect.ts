import { Vector } from "../tools/Vector";
import { Entity } from "../core/Entity";
import { Cluster } from "../types/cluster.types";

// implementation of a Rect Entity class
export class Rect
  extends Entity
  implements Cluster.EntityType<Cluster.RectOptions>
{
  readonly tag = Cluster.EntityTag.RECT; // Discriminant property
  width: number;
  height: number;
  style: Cluster.ShapeStyle;

  constructor(options: Cluster.RectOptions) {
    super(Cluster.EntityTag.RECT, options);
    this.width = options.width;
    this.height = options.height;
    this.style = options.style || {};
  }

  get center() {
    return new Vector(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
  }
}
