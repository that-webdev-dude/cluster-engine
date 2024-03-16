import { Cluster } from "./cluster/types/cluster.types";
import { Entity, Container, Rect, Sprite, TileSprite } from "./cluster";

type RectType = Rect | Sprite | TileSprite;

/**
 * World:
 * this class is a collection of methods to update entities and containers in the game world
 */
export class World {
  static Collider = class {
    static detect(source: RectType, target: RectType) {
      let collision =
        source.position.x < target.position.x + target.width &&
        source.position.x + source.width > target.position.x &&
        source.position.y < target.position.y + target.height &&
        source.position.y + source.height > target.position.y;

      // compute the collision normal using the source and target direction vectors
      let nx = target.position.x - source.position.x;
      let ny = target.position.y - source.position.y;
      let overlap = 0;
      if (collision) {
        if (Math.abs(nx) > Math.abs(ny)) {
          if (nx > 0) {
            overlap = source.position.x + source.width - target.position.x;
          } else {
            overlap = target.position.x + target.width - source.position.x;
          }
        } else {
          if (ny > 0) {
            overlap = source.position.y + source.height - target.position.y;
          } else {
            overlap = target.position.y + target.height - source.position.y;
          }
        }
      }

      return { collision, overlap, nx, ny };

      //       return collision;
    }
    static resolve() {}
  };
  /**
   * updates the position of an entity based on its velocity magnitude
   * @param entity the entity to reposition
   * @param dt the delta time
   */
  static repositionEntity(entity: Entity, dt: number) {
    if (entity.velocity.magnitude) {
      entity.position.x += entity.velocity.x * dt;
      entity.position.y += entity.velocity.y * dt;
    }
  }

  /**
   * updates the position of an entity or a container based on its velocity magnitude
   * @param entity the entity to reposition (can be a container or an entity)
   * @param dt the delta time
   */
  static reposition(entity: Entity | Container, dt: number) {
    World.repositionEntity(entity as Entity, dt);
    if (entity instanceof Container && entity.children.length > 0) {
      entity.children.forEach((child) => {
        World.reposition(child as Entity | Container, dt);
      });
    }
  }
}
