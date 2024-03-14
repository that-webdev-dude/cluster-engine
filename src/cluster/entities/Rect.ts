import { Entity } from "../core/Entity";
import { Cluster } from "../types/cluster.types";

export class Rect extends Entity implements Cluster.RectType {
  public width: number;
  public height: number;
  public style: Cluster.ShapeStyle;

  constructor(options: Cluster.RectOptions) {
    const { width = 32, height = 32, style = {}, ...optionals } = options;
    super(Cluster.EntityTag.RECT, optionals as Cluster.EntityOptions);
    this.width = width;
    this.height = height;
    this.style = style;
  }
}
