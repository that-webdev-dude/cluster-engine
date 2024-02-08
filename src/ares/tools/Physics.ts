import Vector from "./Vector";
import Cmath from "./Cmath";

type PhysicsEntity = {
  acceleration: Vector;
  velocity: Vector;
  position: Vector;
  mass?: number;
  // type: PHYSICS_TYPE;
  // solver: PHYSICS_SOLVER;
};

type PhysicsForce = { x: number; y: number };

enum PHYSICS_TYPE {
  dynamic,
  kinematic,
}

enum PHYSICS_SOLVER {
  elastic,
  displacement,
}

class Physics {
  static applyImpulse(entity: PhysicsEntity, force: PhysicsForce, dt: number) {
    this.applyForce(entity, { x: force.x / dt, y: force.y / dt });
    return this;
  }

  static applyForce(entity: PhysicsEntity, force: PhysicsForce) {
    const { acceleration: acc, mass = 1 } = entity;
    acc.x += force.x / mass;
    acc.y += force.y / mass;
    return this;
  }

  static applyFriction(entity: PhysicsEntity, friction: number) {
    const { acceleration: acc, velocity: vel } = entity;
    let frictionForceX = -vel.x * friction;
    let frictionForceY = -vel.y * friction;
    acc.x += frictionForceX; // / mass
    acc.y += frictionForceY; // / mass
    return this;
  }

  static applyGravity(entity: PhysicsEntity, gravity: number) {
    const { acceleration: acc } = entity;
    acc.y += gravity;
    return this;
  }

  static updateEntity(entity: PhysicsEntity, dt: number) {
    const { acceleration: acc, velocity: vel, position: pos } = entity;
    vel.x += acc.x * dt;
    vel.y += acc.y * dt;
    pos.x += vel.x * dt;
    pos.y += vel.y * dt;
    acc.x = 0;
    acc.y = 0;
    // detect collisions
    // resolve collisions
  }

  static update(entities: PhysicsEntity[], dt: number) {
    for (const entity of entities) {
      Physics.updateEntity(entity, dt);
      // collision detect
      // collision resolve
    }
  }
}

export default Physics;
