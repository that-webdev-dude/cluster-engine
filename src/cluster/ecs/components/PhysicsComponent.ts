import { Component } from "../../core/Component";
import { Vector } from "../../tools/Vector";

type ForceGenerator = () => Vector;

// Interface for component properties
interface PhysicsOptions {
  friction?: number;
  impulses?: ForceGenerator[];
  forces?: ForceGenerator[];
  mass?: number;
  minSpeed?: number;
  maxSpeed?: number;
}

// Physics Component
export class PhysicsComponent implements Component {
  acceleration: Vector;
  velocity: Vector;
  friction: number;
  impulses: ForceGenerator[];
  forces: ForceGenerator[];
  mass: number;
  minSpeed?: number | undefined;
  maxSpeed?: number | undefined;

  constructor({
    friction = 0,
    impulses = [],
    forces = [],
    mass = 1,
    minSpeed = undefined,
    maxSpeed = undefined,
  }: PhysicsOptions) {
    this.acceleration = new Vector(0, 0);
    this.velocity = new Vector(0, 0);
    this.friction = friction;
    this.impulses = impulses;
    this.forces = forces;
    this.mass = mass;
    this.minSpeed = minSpeed;
    this.maxSpeed = maxSpeed;
  }
}
