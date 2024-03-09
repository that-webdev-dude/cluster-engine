import { Entity } from "../core/Entity";
import { Cluster } from "../types/cluster.types";

export class Rect extends Entity implements Cluster.RectType {
  public width: number;
  public height: number;
  constructor(options: Cluster.RectOptions) {
    const { width = 32, height = 32, ...optionals } = options;
    super(Cluster.EntityTag.RECT, optionals as Cluster.EntityOptions);
    this.width = width;
    this.height = height;
  }
}
