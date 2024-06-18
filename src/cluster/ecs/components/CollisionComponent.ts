import { Component } from "../../core/Component";
import { Entity } from "../../core/Entity";

interface CollisionData {
  entity: Entity;
}

interface Resolver {
  mask: number;
  type: string;
  actions?: {
    name: string;
    data: number;
  }[];
}

// Interface for collision component properties
export interface CollisionOptions {
  layer?: number;
  mask?: number;
  resolvers?: Resolver[];
}

// Collision Component
export class CollisionComponent implements Component {
  public collisions: Array<CollisionData>;
  readonly layer: number; // collision layer of this entity
  readonly mask: number; // what layers this entity can collide with
  readonly resolvers: Resolver[]; // what to do when collision happens with certain layers

  constructor({ layer = 0, mask = 1, resolvers = [] }: CollisionOptions = {}) {
    this.collisions = [];
    this.layer = layer;
    this.mask = mask;
    this.resolvers = resolvers;
  }
}
