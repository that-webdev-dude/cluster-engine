import { Component } from "../cluster";
import { Vector } from "../cluster";
import { Entity } from "../cluster";
import { Resolver } from "../systems/ResolutionSystem";

// Component errors
enum ComponentErrors {}

// Component types
// export interface CollisionData {
//   entity: Entity;
// }
// type Resolver = "die" | "slide";

interface CollisionResolver {
  mask: number;
  type: Resolver;
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
  readonly data: Map<Resolver, Entity[]>;
  readonly resolvers: CollisionResolver[];

  constructor({ layer = 0, mask = 1, resolvers = [] }: ComponentOptions = {}) {
    this.layer = layer;
    this.mask = mask;
    this.data = new Map();
    this.resolvers = resolvers;
  }
}
