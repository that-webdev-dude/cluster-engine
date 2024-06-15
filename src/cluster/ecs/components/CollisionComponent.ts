import { Component } from "../../core/Component";
import { Entity } from "../../core/Entity";

interface CollisionData {
  entity: Entity;
}

// Interface for collision component properties
export interface CollisionOptions {
  layer?: number;
  mask?: number;
}

// Collision Component
export class CollisionComponent implements Component {
  readonly collisions: Array<CollisionData>;
  readonly layer: number; // collision layer of this entity
  readonly mask: number; // what layers this entity can collide with

  constructor({ layer = 0, mask = 1 }: CollisionOptions = {}) {
    this.collisions = [];
    this.layer = layer;
    this.mask = mask;
  }
}
