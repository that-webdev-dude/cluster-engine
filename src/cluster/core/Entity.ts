import { Vector } from "../tools/Vector";
import { Cluster } from "../types/cluster.types";

// implementation of a Base Entity class
export abstract class Entity
  implements Cluster.EntityType<Cluster.BaseEntityOptions>
{
  readonly tag: Cluster.EntityTag; // Discriminant property
  acceleration: Vector;
  velocity: Vector;
  position: Vector;
  anchor: Vector;
  scale: Vector;
  pivot: Vector;
  angle: number;
  alpha: number;
  mass: number;
  dead: boolean;
  visible: boolean;
  constructor(tag: Cluster.EntityTag, options: Cluster.BaseEntityOptions = {}) {
    this.tag = tag;
    this.acceleration = options.acceleration || new Vector(0, 0);
    this.velocity = options.velocity || new Vector(0, 0);
    this.position = options.position || new Vector(0, 0);
    this.anchor = options.anchor || new Vector(0, 0);
    this.scale = options.scale || new Vector(1, 1);
    this.pivot = options.pivot || new Vector(0, 0);
    this.angle = options.angle || 0;
    this.alpha = options.alpha || 1;
    this.mass = options.mass || 1;
    this.dead = options.dead || false;
    this.visible = options.visible || true;
  }

  get direction() {
    return Vector.direction(this.velocity);
  }

  abstract get center(): Vector;
  abstract get width(): number;
  abstract get height(): number;
  abstract get boundingBox(): Cluster.Box;
}
