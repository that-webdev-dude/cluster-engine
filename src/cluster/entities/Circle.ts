import { Entity } from "../core/Entity";
import { Cluster } from "../types/cluster.types";

export class Circle extends Entity implements Cluster.CircleType {
  public radius: number;
  public style: Cluster.ShapeStyle;

  constructor(options: Cluster.CircleOptions) {
    const { radius = 16, style = {}, ...optionals } = options;
    super(Cluster.EntityTag.CIRCLE, optionals as Cluster.EntityOptions);
    this.radius = radius;
    this.style = style;
  }
}
