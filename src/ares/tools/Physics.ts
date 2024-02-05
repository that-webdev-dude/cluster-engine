import Vector from "./Vector";
import Cmath from "./Cmath";

type PhysicsEntity = {
  acceleration: Vector;
  velocity: Vector;
  position: Vector;
  speed: number;
  mass: number;
};

type PhysicsForce = { x: number; y: number };

class Physics {
  /**
   * apply a force to entity
   * @param {*} entity
   * @param {*} force
   */
  static applyForce(entity: PhysicsEntity, force: PhysicsForce) {
    const { acceleration: acc, mass = 1 } = entity;
    acc.x += force.x / mass;
    acc.y += force.y / mass;
  }

  /**
   * apply friction to entity
   * @param {Entity} entity
   * @param {Number} friction
   */
  static applyFriction(entity: PhysicsEntity, friction: number) {
    entity.velocity.x += -Math.sign(entity.velocity.x) * friction;
    entity.velocity.y += -Math.sign(entity.velocity.y) * friction;
  }

  /**
   * reposition
   * @param {*} entity
   */
  static reposition(entity: PhysicsEntity) {
    entity.velocity
      .set(
        Cmath.clamp(entity.velocity.x, -entity.speed, entity.speed),
        Cmath.clamp(entity.velocity.y, -entity.speed, entity.speed)
      )
      .add(entity.acceleration);
    entity.position.add(entity.velocity);
    entity.acceleration.set(0, 0);
  }
}

export default Physics;
