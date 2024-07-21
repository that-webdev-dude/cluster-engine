import { Container, Entity, System, Cmath } from "../cluster";
import { Collision } from "../components/Collision";
import { Transform } from "../components/Transform";
import { Hitbox } from "../components/Hitbox";
import { Size } from "../components/Size";
import { Resolver } from "./ResolutionSystem";

// system dependencies
const SystemComponents = {
  Collision,
  Transform,
  Size,
  Hitbox, // optional
};

// system errors
enum SystemErrors {
  DependencyError = "[CollisionSystem]: missing required components Transform, Size, Hitbox?",
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

    return (entityCollision.mask & otherCollision.layer) !== 0;
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

  private _getResolverType(entity: Entity, other: Entity): Resolver | "" {
    const collision = entity.getComponent(SystemComponents.Collision);

    if (!collision) return "";

    const resolver = collision.resolvers.find((resolver) => {
      return (
        resolver.mask === other.getComponent(SystemComponents.Collision)?.layer
      );
    });

    return resolver?.type || "";
  }

  private _storeCollision(entity: Entity, other: Entity): void {
    const collision = entity.getComponent(SystemComponents.Collision);

    // if there are no resolvers, don't store the collision
    if (!collision || !collision.resolvers.length) return;

    // add an entity to the collision data only if it doesn't already exist
    const resolverType = this._getResolverType(entity, other);
    if (resolverType) {
      if (collision.data.has(resolverType)) {
        const data = collision.data.get(resolverType);
        if (data) {
          if (!data.includes(other)) {
            data.push(other);
          }
        }
      } else {
        collision.data.set(resolverType, [other]);
      }
    }
    // if (!collision.data.size) {
    //   collision.data.add({ entity: other });
    //   return;
    // } else {
    //   collision.data.forEach((data) => {
    //     if (data.entity.id !== other.id) {
    //       collision.data.add({ entity: other });
    //     }
    //   });
    // }
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
