import Vector from "../tools/Vector";

type PhysicsEntityArray = Array<PhysicsEntity | PhysicsEntityArray>;
type PhysicsEntity = {
  physicsType: PhysicsType;
  acceleration: Vector;
  velocity: Vector;
  position: Vector;
  mass?: number;
  dead: boolean;
};
type PhysicsForce = {
  x: number;
  y: number;
};
enum PhysicsType {
  KINEMAIC,
  DYNAMIC,
}

// physics engine
class Physics {
  static applyForce(entity: PhysicsEntity, force: PhysicsForce) {
    const { mass = 1 } = entity;
    entity.acceleration.x += force.x / mass;
    entity.acceleration.y += force.y / mass;
    return this;
  }

  static applyFriction(entity: PhysicsEntity, friction: number) {
    this.applyForce(entity, {
      x: -entity.velocity.x * friction,
      y: -entity.velocity.y * friction,
    });
    return this;
  }

  static applyGravity(entity: PhysicsEntity, gravity: number) {
    this.applyForce(entity, {
      x: 0,
      y: gravity,
    });
    return this;
  }

  static applyImpulse(entity: PhysicsEntity, force: PhysicsForce, dt: number) {
    this.applyForce(entity, {
      x: force.x / dt,
      y: force.y / dt,
    });
    return this;
  }

  static eulerIntegrator(entity: PhysicsEntity, dt: number) {
    if (entity.acceleration.x !== 0 || entity.acceleration.y !== 0) {
      entity.velocity.x += entity.acceleration.x * dt;
      entity.velocity.y += entity.acceleration.y * dt;
      entity.position.x += entity.velocity.x * dt;
      entity.position.y += entity.velocity.y * dt;
      entity.acceleration.set(0, 0);
    }
    return this;
  }

  static verletIntegrator(entity: PhysicsEntity, dt: number) {
    if (entity.acceleration.x !== 0 || entity.acceleration.y !== 0) {
      let vx = entity.velocity.x + entity.acceleration.x * dt;
      let vy = entity.velocity.y + entity.acceleration.y * dt;
      let dx = (entity.velocity.x + vx) * 0.5 * dt;
      let dy = (entity.velocity.y + vy) * 0.5 * dt;
      entity.position.x += dx;
      entity.position.y += dy;
      entity.velocity.x = vx;
      entity.velocity.y = vy;
      entity.acceleration.set(0, 0);
    }
    return this;
  }

  static updateEntity(entity: PhysicsEntity, dt: number) {
    if (entity.physicsType === PhysicsType.DYNAMIC) {
      this.applyGravity(entity, 1000);
    }
    this.verletIntegrator(entity, dt);
  }

  static updateEntities(entities: PhysicsEntityArray, dt: number) {
    for (const item of entities) {
      if (Array.isArray(item)) {
        this.updateEntities(item, dt);
      } else {
        this.updateEntity(item, dt);
      }
    }

    // detect
    // player vs ground → displace player (with ground velocity)
    // player vs platform → displace player (with platform velocity)
    // platform vs ground → displace platform (invert platform velocity)
  }

  // static updateWithCollisions(
  //   entity: DynamicEntity,
  //   targets: Array<StaticEntity>,
  //   dt: number
  // ) {
  //   const { acceleration: acc, velocity: vel, position: pos } = entity;
  //   vel.x += acc.x * dt;
  //   vel.y += acc.y * dt;

  //   // pass1 computes the collision times and sort in reverse order.
  //   let collisionTimes = Array<{ index: number; time: number }>();
  //   targets.forEach((target, index) => {
  //     const { time } = this.Detector.detect(entity, target, dt);
  //     if (time) {
  //       collisionTimes.push({ index, time });
  //     }
  //   });
  //   collisionTimes.sort((a, b) => b.time - a.time);

  //   // pass2: the first resolved is the one with smaller collision time.
  //   collisionTimes.forEach(({ index }) => {
  //     const { collision, normal, time } = this.Detector.detect(
  //       entity,
  //       targets[index],
  //       dt
  //     );
  //     if (collision && normal && time) {
  //       vel.x += normal.x * Math.abs(vel.x) * (1 - time);
  //       vel.y += normal.y * Math.abs(vel.y) * (1 - time);
  //       // vel.x += normal.x * Math.abs(vel.x);
  //       // vel.y += normal.y * Math.abs(vel.y);
  //     }
  //   });

  //   pos.x += vel.x * dt;
  //   pos.y += vel.y * dt;
  //   acc.x = 0;
  //   acc.y = 0;
  // }

  // static updateEntity(entity: PhysicsEntity, dt: number) {
  //   const { acceleration: acc, velocity: vel, position: pos } = entity;
  //   vel.x += acc.x * dt;
  //   vel.y += acc.y * dt;
  //   pos.x += vel.x * dt;
  //   pos.y += vel.y * dt;
  //   acc.x = 0;
  //   acc.y = 0;
  // }

  // static getEntityDisplacement(entity: PhysicsEntity, dt: number): Vector {
  //   const { acceleration: acc, velocity: vel, position: pos } = entity;
  //   vel.x += acc.x * dt;
  //   vel.y += acc.y * dt;
  //   const dx = vel.x * dt;
  //   const dy = vel.y * dt;
  //   return new Vector(dx, dy);
  // }

  // static updateWithCollision(
  //   entity: DynamicEntity,
  //   target: StaticEntity,
  //   dt: number
  // ) {
  //   const { acceleration: acc, velocity: vel, position: pos } = entity;
  //   vel.x += acc.x * dt;
  //   vel.y += acc.y * dt;

  //   const { collision, contact, normal, time } = AABB.detect(
  //     entity,
  //     target,
  //     dt
  //   );
  //   if (collision) {
  //     vel.x += normal.x * Math.abs(vel.x);
  //     vel.y += normal.y * Math.abs(vel.y);
  //   }

  //   pos.x += vel.x * dt;
  //   pos.y += vel.y * dt;
  //   acc.x = 0;
  //   acc.y = 0;
  // }

  // static update(entities: PhysicsEntity[], dt: number) {
  //   for (const entity of entities) {
  //     Physics.updateEntity(entity, dt);
  //     // collision detect
  //     // collision resolve
  //   }
  // }
}

export default Physics;
