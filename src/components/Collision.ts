import { Component } from "../cluster";
import { Vector } from "../cluster";
import { Entity } from "../cluster";

// Component errors
enum ComponentErrors {}

// Component types
export interface CollisionData {
  entity: Entity;
}

interface CollisionResolver {
  mask: number;
  type: "die";
  actions?: {
    name: string;
    data: number | string | boolean;
  }[];
}

// Interface for component properties
export interface ComponentOptions {
  layer?: number;
  mask?: number;
  resolvers?: CollisionResolver[];
}

// Transform Component
export class Collision implements Component {
  readonly layer: number;
  readonly mask: number;
  readonly data: Set<CollisionData>;
  readonly resolvers: CollisionResolver[];

  constructor({ layer = 0, mask = 1, resolvers = [] }: ComponentOptions = {}) {
    this.layer = layer;
    this.mask = mask;
    this.data = new Set();
    this.resolvers = resolvers;
  }
}
