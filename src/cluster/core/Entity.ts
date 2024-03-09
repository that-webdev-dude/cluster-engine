import { Vector } from "../tools/Vector";
import { Cluster } from "../types/cluster.types";

export abstract class Entity implements Cluster.EntityType {
  readonly tag: Cluster.EntityTag; // Discriminant property
  position: Vector;
  anchor: Vector;
  scale: Vector;
  pivot: Vector;
  angle: number;
  alpha: number;
  dead: boolean;
  visible: boolean;

  constructor(tag: Cluster.EntityTag, options: Cluster.EntityOptions = {}) {
    this.tag = tag;
    this.position = options.position || new Vector(0, 0);
    this.anchor = options.anchor || new Vector(0, 0);
    this.scale = options.scale || new Vector(1, 1);
    this.pivot = options.pivot || new Vector(0, 0);
    this.angle = options.angle || 0;
    this.alpha = options.alpha || 1;
    this.dead = options.dead || false;
    this.visible = options.visible || true;
  }
}
