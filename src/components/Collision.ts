import { Component } from "../cluster";
import { Vector } from "../cluster";
import { Entity } from "../cluster";

// Component errors
enum ComponentErrors {}

// Component types
export interface CollisionData {
  entity: Entity;
}

// Interface for component properties
export interface ComponentOptions {
  layer?: number;
  mask?: number;
}

// Transform Component
export class Collision implements Component {
  readonly layer: number;
  readonly mask: number;
  // readonly data: Array<CollisionData>;
  data: Set<CollisionData>;

  constructor({ layer = 0, mask = 1 }: ComponentOptions = {}) {
    this.layer = layer;
    this.mask = mask;
    this.data = new Set();
  }
}
