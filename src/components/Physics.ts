import { Component } from "../cluster";
import { Vector } from "../cluster";

// Component errors
enum ComponentErrors {}

type ForceGenerator = (dt: number, t: number) => { x: number; y: number };

// Interface for component properties
export interface ComponentOptions {
  generators?: ForceGenerator[];
  mass?: number;
}

// Transform Component
export class Physics implements Component {
  readonly type = "Physics";
  acceleration: Vector;
  generators: ForceGenerator[];
  mass: number;

  constructor({ mass = 1, generators = [] }: ComponentOptions = {}) {
    this.acceleration = new Vector(0, 0);
    this.generators = generators;
    this.mass = mass;
  }
}
