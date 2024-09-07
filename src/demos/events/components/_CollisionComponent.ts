import * as Cluster from "../../../cluster";
import * as Types from "../types";

export interface CollisionOptions {
  layer: number;
  mask?: number;
  hitbox: Types.CollisionHitbox;
  resolvers?: Types.CollisionResolver[];
  detectable?: boolean;
}

/** Collision component
 * the collision component is used to store the collision data of an entity
 * @tag Collision
 * @options layer, mask, hitbox, resolvers
 * @properties data, mask, layer, hitbox, resolvers
 */
export class CollisionComponent extends Cluster.Component {
  readonly data: Map<Types.CollisionResolverType, Types.CollisionData[]>;
  readonly mask: number;
  readonly layer: number;
  readonly hitbox: Types.CollisionHitbox;
  readonly resolvers: Types.CollisionResolver[];
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
