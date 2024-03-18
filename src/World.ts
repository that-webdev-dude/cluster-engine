import {
  Entity,
  Container,
  Rect,
  Sprite,
  TileSprite,
  TileMap,
} from "./cluster";
import { Cluster } from "./cluster/types/cluster.types";

type Collidable = Rect | Sprite | TileSprite;
type CollisionDirection = "top" | "bottom" | "left" | "right" | "none";
type CollisionInfo = {
  direction: CollisionDirection;
  collision: boolean;
  overlap: number;
  source: Collidable;
  target: Collidable;
};

type Force = Cluster.Point;

/**
 * World:
 * this class is a collection of methods to update entities and containers in the game world
 */
export class World {
  /** gravity force */
  static gravity: Force = { x: 0, y: 9.8 };
  /** friction constant */
  static friction: number = 5000;

  static Collider = class {
    /**
     * detects collision between an entity and surrounding non walkable tiles
     * @param entity the entity to check for collision
     * @param tilemap the tilemap to check for collision
     * @returns the collision info array
     */
    static detectWallCollision(
      entity: Collidable,
      tilemap: TileMap
    ): CollisionInfo[] {
      let tiles = tilemap.tilesAtBoxCorners(
        entity.position,
        entity.width,
        entity.height
      );
      let [topLeft, topRight, bottomLeft, bottomRight] = tiles.map((tile) => {
        if (tile) {
          return "walkable" in tile.frame && !tile.frame.walkable;
        }
      });

      let collisionInfo: CollisionInfo[] = [];
      if (entity.direction.y !== 0) {
        if (entity.direction.y < 0 && topLeft && topRight) {
          if (tiles[0]) {
            let overlap = Math.abs(
              entity.position.y - tiles[0].position.y - tiles[0].height
            );
            collisionInfo.push({
              collision: true,
              overlap,
              direction: "top",
              source: entity,
              target: tiles[0],
            });
          }
        }
        if (entity.direction.y > 0 && bottomLeft && bottomRight) {
          if (tiles[2]) {
            let overlap = Math.abs(
              tiles[2].position.y - entity.position.y - entity.height
            );
            collisionInfo.push({
              collision: true,
              overlap,
              direction: "bottom",
              source: entity,
              target: tiles[2],
            });
          }
        }
      }

      if (entity.direction.x !== 0) {
        if (entity.direction.x < 0 && topLeft && bottomLeft) {
          if (tiles[0]) {
            let overlap = Math.abs(
              entity.position.x - tiles[0].position.x - tiles[0].width
            );
            collisionInfo.push({
              collision: true,
              overlap,
              direction: "left",
              source: entity,
              target: tiles[0],
            });
          }
        }
        if (entity.direction.x > 0 && topRight && bottomRight) {
          if (tiles[1]) {
            let overlap = Math.abs(
              tiles[1].position.x - entity.position.x - entity.width
            );
            collisionInfo.push({
              collision: true,
              overlap,
              direction: "right",
              source: entity,
              target: tiles[1],
            });
          }
        }
      }

      return collisionInfo;
    }

    static detectOneToOne(source: Collidable, target: Collidable) {
      let collision =
        source.position.x < target.position.x + target.width &&
        source.position.x + source.width > target.position.x &&
        source.position.y < target.position.y + target.height &&
        source.position.y + source.height > target.position.y;

      let nx = target.position.x - source.position.x;
      let ny = target.position.y - source.position.y;
      let overlap = 0;
      let direction = "none";

      if (collision) {
        if (Math.abs(nx) > Math.abs(ny)) {
          if (nx > 0) {
            direction = "right";
            overlap = source.position.x + source.width - target.position.x;
          } else {
            direction = "left";
            overlap = target.position.x + target.width - source.position.x;
          }
        } else {
          if (ny > 0) {
            direction = "bottom";
            overlap = source.position.y + source.height - target.position.y;
          } else {
            direction = "top";
            overlap = target.position.y + target.height - source.position.y;
          }
        }
      }

      return { collision, overlap, direction, source, target };
    }

    static detectOneToMany(source: Collidable, targets: Collidable[]) {
      let collisionInfo: CollisionInfo[] = [];
      targets.forEach((target) => {
        let info = World.Collider.detectOneToOne(source, target);
        if (info.collision) collisionInfo.push(info as CollisionInfo);
      });
      return collisionInfo;
    }

    static detectManyToMany(sources: Collidable[], targets: Collidable[]) {
      let collisionInfo: CollisionInfo[] = [];
      sources.forEach((source) => {
        targets.forEach((target) => {
          let info = World.Collider.detectOneToOne(source, target);
          if (info.collision) collisionInfo.push(info as CollisionInfo);
        });
      });
      return collisionInfo;
    }

    static resolve(
      collisionInfo: CollisionInfo,
      done?: (collisionInfo: CollisionInfo) => void
    ) {
      if (collisionInfo.collision) {
        let { overlap, direction, source } = collisionInfo;
        switch (direction) {
          case "top":
            source.position.y += Math.abs(overlap) + 1;
            break;
          case "bottom":
            source.position.y -= Math.abs(overlap) - 1;
            break;
          case "left":
            source.position.x += Math.abs(overlap) + 1;
            break;
          case "right":
            source.position.x -= Math.abs(overlap) - 1;
            break;
          default:
            break;
        }
        done && done(collisionInfo);
      }
    }
  };

  /**
   * applies a force to a dynamic entity
   * @param entity the entity to apply the force to
   * @param force the force to apply
   */
  static applyForce(entity: Entity, force: Force) {
    entity.acceleration.x += force.x / entity.mass;
    entity.acceleration.y += force.y / entity.mass;
    return this;
  }

  /**
   * applies the World gravity to a dynamic entity
   * @param entity the entity to apply gravity to
   */
  static applyGravity(entity: Entity) {
    this.applyForce(entity, World.gravity);
    return this;
  }

  /**
   * applies a friction force to a dynamic entity
   * @param entity the entity to apply the friction to
   */
  static applyFriction(entity: Entity) {
    this.applyForce(entity, {
      x: -entity.velocity.x * World.friction,
      y: -entity.velocity.y * World.friction,
    });
    return this;
  }

  /**
   * applies an impulse to a dynamic entity
   * @param entity the entity to apply the impulse to
   * @param force the force to apply
   * @param dt the delta time
   */
  static applyImpulse(entity: Entity, force: Force, dt: number) {
    this.applyForce(entity, {
      x: force.x / dt,
      y: force.y / dt,
    });
    return this;
  }

  /**
   * applies the Euler integrator for repositioning an entity
   * @param entity the entity to apply the integrator to
   * @param dt the delta time
   */
  static eulerIntegrator(entity: Entity, dt: number) {
    if (entity.acceleration.x !== 0 || entity.acceleration.y !== 0) {
      entity.velocity.x += entity.acceleration.x * dt;
      entity.velocity.y += entity.acceleration.y * dt;
      entity.position.x += entity.velocity.x * dt;
      entity.position.y += entity.velocity.y * dt;
      entity.acceleration.set(0, 0);
    }
    return this;
  }

  /**
   * applies the Verlet integrator for repositioning an entity
   * @param entity the entity to apply the integrator to
   * @param dt the delta time
   */
  static verletIntegrator(entity: Entity, dt: number) {
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

  /**
   * updates the position of an entity based on its velocity magnitude
   * @param entity the entity to reposition
   * @param dt the delta time
   */
  static repositionEntity(entity: Entity, dt: number) {
    // switch (entity.physics) {
    //   case Cluster.EntityPhysics.DYNAMIC:
    //     entity.velocity.x += entity.acceleration.x * dt + World.gravity.x * dt;
    //     entity.velocity.y += entity.acceleration.y * dt + World.gravity.y * dt;
    //     entity.position.x += entity.velocity.x * dt;
    //     entity.position.y += entity.velocity.y * dt + 100 * dt;
    //     entity.acceleration.set(0, 0);
    //     break;
    //   case Cluster.EntityPhysics.KINEMATIC:
    //     entity.velocity.x += entity.acceleration.x * dt;
    //     entity.velocity.y += entity.acceleration.y * dt;
    //     entity.position.x += entity.velocity.x * dt;
    //     entity.position.y += entity.velocity.y * dt;
    //     entity.acceleration.set(0, 0);
    //     break;
    // }
  }

  /**
   * updates the position of an entity or a container based on its velocity magnitude
   * @param entity the entity to reposition (can be a container or an entity)
   * @param dt the delta time
   */
  static reposition(entity: Entity | Container, dt: number) {
    // World.repositionEntity(entity as Entity, dt);
    // if (entity instanceof Container && entity.children.length > 0) {
    //   entity.children.forEach((child) => {
    //     World.reposition(child as Entity | Container, dt);
    //   });
    // }
  }
}
