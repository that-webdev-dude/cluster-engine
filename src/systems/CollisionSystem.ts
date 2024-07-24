import { Container, Entity, System, Vector } from "../cluster";
import { Collision } from "../components/Collision";
import { Transform } from "../components/Transform";
import { Hitbox } from "../components/Hitbox";
import { Size } from "../components/Size";
// import Cluster from "../cluster";

// system dependencies
const SystemComponents = {
  Collision,
  Transform,
  Size,
  Hitbox,
};

// system errors
enum SystemErrors {
  DependencyError = "[CollisionSystem]: missing required components Transform, Size, Hitbox",
}

// system cache
let SystemCache = {
  entities: new Container<Entity>(),
};

class AABBCollision {
  private static _getHitbox(entity: Entity): Hitbox {
    const hitbox = entity.getComponent(SystemComponents.Hitbox);

    if (!hitbox)
      throw new Error(`${entity.type}: ${SystemErrors.DependencyError}`);

    return hitbox;
  }

  static getOverlap(entity: Entity, other: Entity): Vector {
    const entityHitbox = this._getHitbox(entity);
    const otherHitbox = this._getHitbox(other);

    const x1 = Math.max(entityHitbox.x, otherHitbox.x);
    const x2 = Math.min(
      entityHitbox.x + entityHitbox.width,
      otherHitbox.x + otherHitbox.width
    );
    const y1 = Math.max(entityHitbox.y, otherHitbox.y);
    const y2 = Math.min(
      entityHitbox.y + entityHitbox.height,
      otherHitbox.y + otherHitbox.height
    );

    const overlapX = x2 - x1;
    const overlapY = y2 - y1;

    return new Vector(overlapX, overlapY);
  }

  static getNormal(entity: Entity, other: Entity, overlap: Vector): Vector {
    const entityTransform = entity.getComponent(SystemComponents.Transform);
    const otherTransform = other.getComponent(SystemComponents.Transform);

    if (!entityTransform || !otherTransform)
      throw new Error(`${entity.type}: ${SystemErrors.DependencyError}`);

    if (overlap.x < overlap.y) {
      return entityTransform.position.x < otherTransform.position.x
        ? new Vector(-1, 0)
        : new Vector(1, 0);
    } else if (overlap.x > overlap.y) {
      return entityTransform.position.y < otherTransform.position.y
        ? new Vector(0, -1)
        : new Vector(0, 1);
    } else if (overlap.x === overlap.y) {
      // ... edge case
    }
    return new Vector(0, 0);
  }

  static testCollision(entity: Entity, other: Entity) {
    const entityHitbox = this._getHitbox(entity);
    const otherHitbox = this._getHitbox(other);

    if (!entityHitbox || !otherHitbox) return false;

    return (
      entityHitbox.x < otherHitbox.x + otherHitbox.width &&
      entityHitbox.x + entityHitbox.width > otherHitbox.x &&
      entityHitbox.y < otherHitbox.y + otherHitbox.height &&
      entityHitbox.y + entityHitbox.height > otherHitbox.y
    );
  }
}

export class CollisionSystem extends System {
  // AABB collision detection
  private _getHitbox(entity: Entity): Hitbox {
    const hitbox = entity.getComponent(SystemComponents.Hitbox);

    if (!hitbox)
      throw new Error(`${entity.type}: ${SystemErrors.DependencyError}`);

    return hitbox;
  }

  private _getOverlap(entity: Entity, other: Entity): Vector {
    const entityHitbox = this._getHitbox(entity);
    const otherHitbox = this._getHitbox(other);

    const x1 = Math.max(entityHitbox.x, otherHitbox.x);

    const x2 = Math.min(
      entityHitbox.x + entityHitbox.width,
      otherHitbox.x + otherHitbox.width
    );
    const y1 = Math.max(entityHitbox.y, otherHitbox.y);
    const y2 = Math.min(
      entityHitbox.y + entityHitbox.height,
      otherHitbox.y + otherHitbox.height
    );

    const overlapX = x2 - x1;
    const overlapY = y2 - y1;

    return new Vector(overlapX, overlapY);
  }

  private _getNormal(entity: Entity, other: Entity, overlap: Vector): Vector {
    const entityTransform = entity.getComponent(SystemComponents.Transform);
    const otherTransform = other.getComponent(SystemComponents.Transform);

    if (!entityTransform || !otherTransform)
      throw new Error(`${entity.type}: ${SystemErrors.DependencyError}`);

    if (overlap.x < overlap.y) {
      return entityTransform.position.x < otherTransform.position.x
        ? new Vector(-1, 0)
        : new Vector(1, 0);
    } else if (overlap.x > overlap.y) {
      return entityTransform.position.y < otherTransform.position.y
        ? new Vector(0, -1)
        : new Vector(0, 1);
    } else if (overlap.x === overlap.y) {
      // ... edge case
    }
    return new Vector(0, 0);
  }

  private _testCollision(entity: Entity, other: Entity) {
    const entityHitbox = this._getHitbox(entity);
    const otherHitbox = this._getHitbox(other);

    if (!entityHitbox || !otherHitbox) return false;

    return (
      entityHitbox.x < otherHitbox.x + otherHitbox.width &&
      entityHitbox.x + entityHitbox.width > otherHitbox.x &&
      entityHitbox.y < otherHitbox.y + otherHitbox.height &&
      entityHitbox.y + entityHitbox.height > otherHitbox.y
    );
  }

  // system specific
  private _validCollision(entity: Entity, other: Entity): boolean {
    const entityCollision = entity.getComponent(SystemComponents.Collision);
    const otherCollision = other.getComponent(SystemComponents.Collision);

    if (!entityCollision || !otherCollision) return false;

    if (entityCollision.resolvers.length === 0) return false;

    const { resolvers } = entityCollision;

    return resolvers.some((resolver) => resolver.mask & otherCollision.layer);
  }

  private _storeCollision(entity: Entity, other: Entity): void {
    const entityCollision = entity.getComponent(SystemComponents.Collision);
    const otherCollision = other.getComponent(SystemComponents.Collision);

    if (!entityCollision || !otherCollision) return;

    const { resolvers } = entityCollision;
    if (resolvers.length === 0) return;

    resolvers.forEach((resolver) => {
      if (resolver.mask & otherCollision.layer) {
        const overlap = this._getOverlap(entity, other);
        const normal = this._getNormal(entity, other, overlap);
        const data = entityCollision.data.get(resolver.type);
        const area = overlap.x * overlap.y;
        if (data) {
          if (!data.some((item) => item.other === other)) {
            data.push({ other, overlap, normal, area });
          }
        } else {
          entityCollision.data.set(resolver.type, [
            { other, overlap, normal, area },
          ]);
        }
      }
    });
  }

  public update(entities: Container<Entity>): void {
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

        if (!this._validCollision(entity, other)) {
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
