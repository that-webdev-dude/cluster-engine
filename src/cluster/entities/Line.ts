import { Entity } from "../core/Entity";
import { Vector } from "../tools/Vector";
import { Cluster } from "../types/cluster.types";

export class Line extends Entity implements Cluster.LineType {
  public start: Vector;
  public end: Vector;
  constructor(options: Cluster.LineOptions) {
    const {
      start = new Vector(0, 0),
      end = new Vector(32, 32),
      ...optionals
    } = options;
    super(Cluster.EntityTag.LINE, optionals as Cluster.EntityOptions);
    this.start = start;
    this.end = end;
  }
}
