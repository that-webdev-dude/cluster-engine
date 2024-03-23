import { Container } from "../core/Container";
import { Entity } from "../core/Entity";
import { Cmath } from "./Cmath";

export class World {
  static GRAVITY = 2000;
  static FRICTION = 2.5;

  // force generators
  static applyForce(
    entity: Entity | Container,
    force: { x: number; y: number }
  ) {
    let mass = "mass" in entity ? entity.mass : 1;
    entity.acceleration.x += force.x / mass;
    entity.acceleration.y += force.y / mass;
    return this;
  }

  static applyFriction(
    entity: Entity | Container,
    friction: number = World.FRICTION
  ) {
    World.applyForce(entity, {
      x: -entity.velocity.x * friction,
      y: -entity.velocity.y * friction,
    });
    return this;
  }

  static applyGravity(
    entity: Entity | Container,
    gravity: number = World.GRAVITY
  ) {
    World.applyForce(entity, {
      x: 0,
      y: gravity,
    });
    return this;
  }

  static applyImpulse(
    entity: Entity | Container,
    force: { x: number; y: number },
    dt: number
  ) {
    World.applyForce(entity, {
      x: force.x / dt,
      y: force.y / dt,
    });
    return this;
  }

  // positioning based on velocity and acceleration
  static reposition(entity: Entity | Container, dt: number, maxSpeed?: number) {
    let vx = entity.velocity.x + entity.acceleration.x * dt;
    let vy = entity.velocity.y + entity.acceleration.y * dt;

    // apply speed limits to velocity
    if (maxSpeed) {
      vx = Cmath.clamp(vx, -maxSpeed, maxSpeed);
      vy = Cmath.clamp(vy, -maxSpeed, maxSpeed);
    }

    let dx = (entity.velocity.x + vx) * 0.5 * dt;
    let dy = (entity.velocity.y + vy) * 0.5 * dt;
    entity.position.x += dx;
    entity.position.y += dy;
    entity.velocity.x = vx;
    entity.velocity.y = vy;

    // apply speed limits to velocity
    if (entity.velocity.magnitude < 0.001) {
      if (entity.acceleration.magnitude !== 0) {
        entity.velocity.x = 0;
        entity.velocity.y = 0;
      }
    }

    entity.acceleration.set(0, 0);
  }

  // screen edge handling
  static screenContain(
    entity: Entity,
    screenWidth: number,
    screenHeight: number
  ) {
    if (entity.position.x < 0) {
      // left
      entity.position.x = 0;
      entity.velocity.x = 0;
    }
    if (entity.position.y < 0) {
      // top
      entity.position.y = 0;
      entity.velocity.y = 0;
    }
    if (entity.position.x + entity.width > screenWidth) {
      // right
      entity.position.x = screenWidth - entity.width;
      entity.velocity.x = 0;
    }
    if (entity.position.y + entity.height > screenHeight) {
      // bottom
      entity.position.y = screenHeight - entity.height;
      entity.velocity.y = 0;
    }
  }

  static screenWrap(entity: Entity, screenWidth: number, screenHeight: number) {
    if (entity.position.x + entity.width < 0) {
      // left
      entity.position.x = screenWidth;
    }
    if (entity.position.y + entity.height < 0) {
      // top
      entity.position.y = screenHeight;
    }
    if (entity.position.x > screenWidth) {
      // right
      entity.position.x = -entity.width;
    }
    if (entity.position.y > screenHeight) {
      // bottom
      entity.position.y = -entity.height;
    }
  }

  static hitScreen(entity: Entity, screenWidth: number, screenHeight: number) {
    return (
      entity.position.x < 0 ||
      entity.position.y < 0 ||
      entity.position.x + entity.width > screenWidth ||
      entity.position.y + entity.height > screenHeight
    );
  }

  static offscreen(entity: Entity, screenWidth: number, screenHeight: number) {
    return (
      entity.position.x + entity.width < 0 ||
      entity.position.y + entity.height < 0 ||
      entity.position.x > screenWidth ||
      entity.position.y > screenHeight
    );
  }

  // collision detection
  static detectRectVsRectCollision(rect1: Entity, rect2: Entity): boolean {
    return (
      rect1.position.x < rect2.position.x + rect2.width &&
      rect1.position.x + rect1.width > rect2.position.x &&
      rect1.position.y < rect2.position.y + rect2.height &&
      rect1.position.y + rect1.height > rect2.position.y
    );
  }
}

// TODO
// const AABB_rayVsRectCollisionNormal = (
//   collisionPoint: Vector,
//   target: Entity
// ): Vector => {
//   let normal = new Vector(0, 0);
//   if (collisionPoint.y === target.position.y) {
//     normal.y = -1;
//   }
//   if (collisionPoint.y === target.position.y + target.height) {
//     normal.y = 1;
//   }
//   if (collisionPoint.x === target.position.x) {
//     normal.x = -1;
//   }
//   if (collisionPoint.x === target.position.x + target.width) {
//     normal.x = 1;
//   }
//   return normal;
// };
// const AABB_rayVsRectCollisionContact = (
//   origin: Vector,
//   direction: Vector,
//   time: number
// ): Vector => {
//   return new Vector(
//     origin.x + time * direction.x,
//     origin.y + time * direction.y
//   );
// };
// const AABB_rayVsRect = (
//   rayOrigin: Vector,
//   rayDirection: Vector,
//   target: Entity
// ): boolean => {
//   const { position, width, height } = target;

//   if (rayDirection.x === 0 && rayDirection.y === 0) return false;

//   let tNearX = (position.x - rayOrigin.x) / rayDirection.x;
//   let tNearY = (position.y - rayOrigin.y) / rayDirection.y;
//   let tFarX = (position.x + width - rayOrigin.x) / rayDirection.x;
//   let tFarY = (position.y + height - rayOrigin.y) / rayDirection.y;

//   // check for infinity

//   if (tNearX > tFarX) {
//     [tNearX, tFarX] = [tFarX, tNearX];
//   }
//   if (tNearY > tFarY) {
//     [tNearY, tFarY] = [tFarY, tNearY];
//   }
//   if (tNearX > tFarY || tNearY > tFarX) return false;

//   let tHitNear = Math.max(tNearX, tNearY);
//   let tHitFar = Math.min(tFarX, tFarY);
//   if (tHitFar < 0) return false;

//   let contact = AABB_rayVsRectCollisionContact(
//     rayOrigin,
//     rayDirection,
//     tHitNear
//   );

//   let normal = AABB_rayVsRectCollisionNormal(contact, target);

//   return true;
// };
