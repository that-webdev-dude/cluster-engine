import * as Cluster from "../../../cluster";

// entities
export type EntityId = number;

// store
export type StoreAction = {
  name: string;
  payload: any;
};

export type StoreEvent = {
  type: string;
  data?: any;
  critical?: boolean;
};

// collision
export type CollisionData = {
  area: number;
  entity: Cluster.Entity;
  normal: Cluster.Vector;
  overlap: Cluster.Vector;
  events?: StoreEvent[];
  actions?: StoreAction[];
};

export type CollisionHitbox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CollisionResolver = {
  type: CollisionResolverType;
  mask: number;
  events?: StoreEvent[];
  actions?: StoreAction[];
};

export type CollisionResolverType =
  | "directional-bounce"
  | "simple-bounce"
  | "bounce"
  | "die"
  | "stop"
  | "sleep"
  | "none"
  | "slide";