import { Component } from "../cluster";
import { Vector } from "../cluster";

// Component errors
enum ComponentErrors {}

export interface IForce {
  inputKey?: string;
  force: {
    x: number;
    y: number;
  };
}

type ForceGenerator = (dt: number, t: number) => { x: number; y: number };

// Interface for component properties
export interface ComponentOptions {
  generators?: ForceGenerator[];
  impulses?: IForce[];
  forces?: IForce[];
  mass?: number;
}

// Transform Component
export class Physics implements Component {
  acceleration: Vector;
  generators: ForceGenerator[];
  impulses: IForce[];
  forces: IForce[];
  mass: number;

  constructor({
    mass = 1,
    forces = [],
    impulses = [],
    generators = [],
  }: ComponentOptions = {}) {
    this.acceleration = new Vector(0, 0);
    this.generators = generators;
    this.impulses = impulses;
    this.forces = forces;
    this.mass = mass;
  }
}
