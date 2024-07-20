import { Container, Entity, System, Cmath } from "../cluster";
import { Collision } from "../components/Collision";
import { Transform } from "../components/Transform";
import { Hitbox } from "../components/Hitbox";
import { Size } from "../components/Size";

// system dependencies
const SystemComponents = {
  Collision,
  Transform,
  Size,
  Hitbox, // optional
  //   Velocity,
  //   Boundary,
};

// system errors
enum SystemErrors {
  DependencyError = "[CollisionSystem]: missing required components Transform, Size, Hitbox?",
}

// system types
export interface CollisionData {
  entity: Entity;
}

// system cache
let SystemCache = {
  entities: new Container<Entity>(),
};

export class CollisionSystem extends System {
  private _canCollide(entity: Entity, other: Entity): boolean {
    const entityCollision = entity.getComponent(SystemComponents.Collision);
    const otherCollision = other.getComponent(SystemComponents.Collision);

    if (!entityCollision || !otherCollision) return false;

    return (
      (entityCollision.mask & otherCollision.layer &&
        otherCollision.mask & entityCollision.layer) !== 0
    );
  }

  private _getHitbox(entity: Entity):
    | Hitbox
    | {
        x: number;
        y: number;
        width: number;
        height: number;
      } {
    const hitbox = entity.getComponent(SystemComponents.Hitbox);

    if (!hitbox) {
      const transform = entity.getComponent(SystemComponents.Transform);
      const size = entity.getComponent(SystemComponents.Size);

      if (!transform || !size) throw new Error(SystemErrors.DependencyError);

      return {
        x: transform.position.x,
        y: transform.position.y,
        width: size.width,
        height: size.height,
      };
    }

    return hitbox;
  }

  private _storeCollision(entity: Entity, other: Entity): void {
    const collision = entity.getComponent(SystemComponents.Collision);

    if (!collision) return;

    // add an entity to the collision data only if it doesn't already exist
    //     collision.data.forEach((data) => {
    //       if (data.entity.id !== other.id) collision.data.add({ entity: other });
    //     });

    //     console.log(collision.data.size);
    //     collision.data.add({ entity: other });
  }

  private _testCollision(entity: Entity, other: Entity) {
    const hitbox1 = this._getHitbox(entity);
    const hitbox2 = this._getHitbox(other);

    if (!hitbox1 || !hitbox2) return false;

    return (
      hitbox1.x < hitbox2.x + hitbox2.width &&
      hitbox1.x + hitbox1.width > hitbox2.x &&
      hitbox1.y < hitbox2.y + hitbox2.height &&
      hitbox1.y + hitbox1.height > hitbox2.y
    );
  }

  update(entities: Container<Entity>): void {
    if (!entities.size) return;

    SystemCache.entities = entities.filter((entity) => {
      return entity.hasComponents(SystemComponents.Collision);
    });

    const size = SystemCache.entities.size;
    if (size < 2) return;

    SystemCache.entities.forEach((entity, index) => {
      for (let i = index + 1; i < size; i++) {
        const other = SystemCache.entities.at(i);

        if (!entity || !other) continue;

        if (!this._canCollide(entity, other)) {
          continue;
        } else {
          if (this._testCollision(entity, other)) {
            this._storeCollision(entity, other);
            this._storeCollision(other, entity);
          }
        }
      }
    });

    SystemCache.entities.clear();
  }
}
