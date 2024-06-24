import { Component } from "../../core/Component";
import { Vector } from "../../tools/Vector";

// Interface for component properties
export interface PhysicsOptions {
  acceleration?: Vector;
  velocity?: Vector;
  friction?: number;
  gravity?: number;
  mass?: number;
  triggerForce?: Vector;
}

// Physics Component
export class PhysicsComponent implements Component {
  acceleration: Vector;
  velocity: Vector;
  friction: number;
  gravity: number;
  mass: number;
  triggerForce: Vector;

  constructor({
    acceleration = new Vector(0, 0),
    velocity = new Vector(0, 0),
    friction = 0.9,
    gravity = 0.3,
    mass = 1,
    triggerForce = new Vector(0, 0),
  }: PhysicsOptions = {}) {
    this.acceleration = Vector.from(acceleration);
    this.velocity = Vector.from(velocity);
    this.friction = friction;
    this.gravity = gravity;
    this.mass = mass;
    this.triggerForce = Vector.from(triggerForce);
  }
}
