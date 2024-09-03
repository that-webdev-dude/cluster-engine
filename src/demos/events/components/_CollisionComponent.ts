import * as Cluster from "../../../cluster";
import * as Events from "../events";

export type CollisionResolverType =
  | "bounce"
  | "die"
  | "stop"
  | "sleep"
  | "none"
  | "slide";

export interface CollisionResolver {
  type: CollisionResolverType;
  mask: number;
  events?: Cluster.Event[];
  actions?: {
    name: string;
    payload: any;
  }[];
}

export interface CollisionHitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CollisionData {
  entity: Cluster.Entity;
  normal: Cluster.Vector;
  overlap: Cluster.Vector;
  area: number;
  events?: Cluster.Event[];
  actions?: {
    name: string;
    payload: any;
  }[];
}

export interface CollisionOptions {
  layer: number;
  mask?: number;
  hitbox: CollisionHitbox;
  resolvers?: CollisionResolver[];
  detectable?: boolean;
}

/** Collision component
 * the collision component is used to store the collision data of an entity
 * @tag Collision
 * @options layer, mask, hitbox, resolvers
 * @properties data, mask, layer, hitbox, resolvers
 */
export class CollisionComponent extends Cluster.Component {
  readonly data: Map<CollisionResolverType, CollisionData[]>;
  readonly mask: number;
  readonly layer: number;
  readonly hitbox: CollisionHitbox;
  readonly resolvers: CollisionResolver[];
  public detectable: boolean;

  constructor({
    layer,
    mask,
    hitbox,
    resolvers,
    detectable,
  }: CollisionOptions) {
    super("Collision");
    this.data = new Map();
    this.mask = mask || 0;
    this.layer = layer;
    this.hitbox = hitbox;
    this.resolvers = resolvers || [];
    this.detectable = detectable || true;
  }

  get hit() {
    return this.data.size > 0;
  }
}
