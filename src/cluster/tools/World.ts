import { Container } from "../core/Container";
import { Entity } from "../core/Entity";
import { Cmath } from "./Cmath";
import { Vector } from "./Vector";
import { Rect } from "../entities/Rect";

type Intersection = {
  contact: Vector;
  normal: Vector;
  time: number;
};
type Collision = Intersection & {
  distance: number;
  overlap: Vector;
  target: Rect;
  main: Rect;
};
type AABB = {
  position: Vector;
  width: number;
  height: number;
  hitbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

class AABBCollision {
  private static _rayVsRectContact(
    origin: Vector,
    direction: Vector,
    time: number
  ): Vector {
    return new Vector(
      origin.x + time * direction.x,
      origin.y + time * direction.y
    );
  }

  private static _rayVsRectNormal(contact: Vector, target: AABB): Vector {
    let normal = new Vector(0, 0);
    if (contact.y === target.position.y) {
      normal.y = -1;
    }
    if (contact.y === target.position.y + target.height) {
      normal.y = 1;
    }
    if (contact.x === target.position.x) {
      normal.x = -1;
    }
    if (contact.x === target.position.x + target.width) {
      normal.x = 1;
    }
    return normal;
  }

  private static _rayVsRect(
    origin: Vector,
    direction: Vector,
    target: AABB
  ): Intersection | null {
    const tMinX = (target.position.x - origin.x) / direction.x;
    const tMaxX = (target.position.x + target.width - origin.x) / direction.x; // prettier-ignore
    const tLeft = Math.min(tMinX, tMaxX);
    const tRight = Math.max(tMinX, tMaxX);

    const tMinY = (target.position.y - origin.y) / direction.y;
    const tMaxY = (target.position.y + target.height - origin.y) / direction.y; // prettier-ignore
    const tTop = Math.min(tMinY, tMaxY);
    const tBottom = Math.max(tMinY, tMaxY);

    const tEnter = Math.max(tLeft, tTop);
    const tExit = Math.min(tRight, tBottom);

    if (tEnter <= tExit && tExit >= 0 && tEnter <= 1) {
      const contact = AABBCollision._rayVsRectContact(
        origin,
        direction,
        tEnter
      );
      const normal = AABBCollision._rayVsRectNormal(contact, target);
      return {
        contact,
        normal,
        time: tEnter,
      };
    } else {
      return null;
    }
  }

  private static _rectOverlap(main: AABB, target: AABB): Vector {
    let minSizeX = main.width + target.width;
    let minSizeY = main.height + target.height;

    let x1 = Math.abs(
      main.position.x + main.width - target.position.x - minSizeX
    );
    let x2 = Math.abs(
      target.position.x + target.width - main.position.x - minSizeX
    );
    let dx = Math.min(x1, x2);

    let y1 = Math.abs(
      main.position.y + main.height - target.position.y - minSizeY
    );
    let y2 = Math.abs(
      target.position.y + target.height - main.position.y - minSizeY
    );
    let dy = Math.min(y1, y2);

    // this is responsability of the appropriate resolver
    if (Math.abs(dx) < Math.abs(dy)) {
      dy = 0;
    } else {
      dx = 0;
    }

    dx = Math.sign(main.position.x - target.position.x) * dx;
    dy = Math.sign(main.position.y - target.position.y) * dy;

    return new Vector(dx, dy);
  }

  private static _rectDistance(main: AABB, target: AABB): number {
    let mx = main.position.x + main.width * 0.5;
    let my = main.position.y + main.height * 0.5;
    let tx = target.position.x + target.width * 0.5;
    let ty = target.position.y + target.height * 0.5;
    return Math.hypot(mx - tx, my - ty);
  }

  private static _rectHitbounds(
    rect: AABB,
    expandAmountX: number = 0,
    expandAmountY: number = 0
  ): AABB {
    if (!rect.hitbox) {
      return rect;
    }
    let mx = rect.position.x + rect.hitbox.x - expandAmountX * 0.5;
    let my = rect.position.y + rect.hitbox.y - expandAmountY * 0.5;
    let mw = rect.hitbox.width + expandAmountX;
    let mh = rect.hitbox.height + expandAmountY;
    return {
      position: new Vector(mx, my),
      width: mw,
      height: mh,
    };
  }

  private static _rectVsRect(main: Rect, target: Rect): Collision | null {
    // TODO
    // expandedTarget needs to be cached somewhere to avoid making a new Rect it every frame

    let mainHitbox = AABBCollision._rectHitbounds(main);
    let targetHitbox = AABBCollision._rectHitbounds(target);
    let targetHitboxExpanded = AABBCollision._rectHitbounds(
      target,
      mainHitbox.width,
      mainHitbox.height
    );

    let rd = Vector.from(main.velocity).normalize();
    let ro = new Vector(
      mainHitbox.position.x + mainHitbox.width * 0.5,
      mainHitbox.position.y + mainHitbox.height * 0.5
    );

    let intersection = AABBCollision._rayVsRect(ro, rd, targetHitboxExpanded);
    if (intersection) {
      let { contact, normal, time } = intersection;
      let distance = AABBCollision._rectDistance(mainHitbox, targetHitbox);
      let overlap = AABBCollision._rectOverlap(mainHitbox, targetHitbox);
      console.log("overlap", overlap);
      return {
        time,
        distance,
        overlap,
        contact,
        normal,
        target,
        main,
      };
    }
    return null;
  }

  private static _rectVsRects(main: Rect, targets: Rect[]): Collision | null {
    let collisions: Collision[] = [];
    for (let target of targets) {
      let collision = this._rectVsRect(main, target);
      if (collision) {
        collisions.push(collision);
      }
    }

    if (collisions.length > 0) {
      let bestCollision = collisions.reduce((a, b) => {
        let timeDiff = a.time - b.time;
        if (timeDiff < 0) return a;
        if (timeDiff > 0) return b;
        return a.distance < b.distance ? a : b;
      });
      return bestCollision;
    } else {
      return null;
    }
  }

  static detect(main: Rect, targets: Rect | Rect[]): Collision | null {
    if (Array.isArray(targets)) {
      return this._rectVsRects(main, targets);
    } else {
      return this._rectVsRect(main, targets);
    }
  }

  static Resolver = class {
    static slide(collision: Collision, done?: (collision: Collision) => void) {
      // slide the main along the target side
      let { overlap, main } = collision;
      main.position.x += overlap.x;
      main.position.y += overlap.y;
      if (overlap.x !== 0) {
        main.velocity.x = 0;
      } else {
        main.velocity.y = 0;
      }

      if (done) {
        done(collision);
      }
    }

    static touch(collision: Collision, done?: (collision: Collision) => void) {
      // stick the main in one spot until it moves again
      let { overlap, main } = collision;
      main.position.x += overlap.x;
      main.position.y += overlap.y;
      main.velocity.x = 0;
      main.velocity.y = 0;

      if (done) {
        done(collision);
      }
    }

    static bounce(collision: Collision, done?: (collision: Collision) => void) {
      // bounce off by reversing the velocity
      let { normal, main } = collision;
      main.velocity.x = normal.x !== 0 ? -main.velocity.x : main.velocity.x;
      main.velocity.y = normal.y !== 0 ? -main.velocity.y : main.velocity.y;

      if (done) {
        done(collision);
      }
    }

    static cross(collision: Collision, done?: (collision: Collision) => void) {
      // cross the other entity but keep moving (like triggers in games)
      if (done) {
        done(collision);
      }
    }
  };
}

class ScreenHandler {
  static contain(entity: Entity, screenWidth: number, screenHeight: number) {
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

  static wrap(entity: Entity, screenWidth: number, screenHeight: number) {
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

  static hit(entity: Entity, screenWidth: number, screenHeight: number) {
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
}

class Physics {
  static GRAVITY = 2000;
  static FRICTION = 2.5;

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
    friction: number = this.FRICTION
  ) {
    this.applyForce(entity, {
      x: -entity.velocity.x * friction,
      y: -entity.velocity.y * friction,
    });
    return this;
  }

  static applyGravity(
    entity: Entity | Container,
    gravity: number = this.GRAVITY
  ) {
    this.applyForce(entity, {
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
    this.applyForce(entity, {
      x: force.x / dt,
      y: force.y / dt,
    });
    return this;
  }

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
}

export class World {
  static Screen = ScreenHandler;
  static Physics = Physics;
  static Collision = AABBCollision;
}
