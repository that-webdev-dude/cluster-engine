import { Component } from "../cluster";
import { Vector } from "../cluster";
import { Entity } from "../cluster";
import { Resolver } from "../systems/ResolutionSystem";

// Component errors
enum ComponentErrors {}

// Interface for component properties
interface CollisionResolver {
  mask: number;
  type: Resolver;
  actions?: {
    name: string;
    data: number | string | boolean;
  }[];
}

interface CollisionData {
  other: Entity;
  overlap: Vector;
  normal: Vector;
  area: number;
}

interface ComponentOptions {
  layer?: number;
  mask?: number;
  resolvers?: CollisionResolver[];
}

// Transform Component
export class Collision implements Component {
  readonly layer: number;
  readonly mask: number;
  readonly data: Map<Resolver, CollisionData[]>;
  readonly resolvers: CollisionResolver[];

  constructor({ layer = 0, mask = 1, resolvers = [] }: ComponentOptions = {}) {
    this.layer = layer;
    this.mask = mask;
    this.data = new Map();
    this.resolvers = resolvers;
  }
}
