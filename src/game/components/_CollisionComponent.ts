import * as Cluster from "../../cluster";

type ResolverType = "bounce" | "die" | "stop" | "sleep" | "none";

interface CollisionHitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CollisionResolver {
  resolver: ResolverType;
  mask: number;
  store?: {
    action: string;
    payload: any;
  }[];
}

interface CollisionData {
  resolver: ResolverType;
  main: Cluster.Entity;
  other: Cluster.Entity;
  store: {
    action: string;
    payload: any;
  }[];
}

interface CollisionOptions {
  layer: number;
  mask: number;
  hitbox: CollisionHitbox;
  resolvers?: CollisionResolver[];
}

/** Collision component
 * @options layer, mask, hitbox, resolvers?
 * @properties layer, mask, resolvers
 */
export class CollisionComponent extends Cluster.Component {
  readonly data: CollisionData[];
  readonly layer: number;
  readonly mask: number;
  readonly hitbox: CollisionHitbox;
  readonly resolvers: CollisionResolver[];

  constructor({ layer, mask, hitbox, resolvers }: CollisionOptions) {
    super("Collision");
    this.data = [];
    this.layer = layer;
    this.mask = mask;
    this.hitbox = hitbox;
    this.resolvers = resolvers || [];
  }

  get hit() {
    return this.data.length > 0;
  }
}
