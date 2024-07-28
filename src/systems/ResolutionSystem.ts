import { Container, Entity, System, Cmath, Vector } from "../cluster";
import { Transform } from "../components/Transform";
import { Velocity } from "../components/Velocity";
import { Collision } from "../components/Collision";
import { Hitbox } from "../components/Hitbox";
import { store } from "../store";

// system dependencies
const SystemComponents = {
  Transform,
  Velocity,
  Collision,
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

// system types
export type Resolver =
  | "die"
  | "slide"
  | "bounce"
  | "push"
  | "pull"
  | "teleport"
  | "warp"
  | "swap"
  | "transform";

export class ResolutionSystem extends System {
  private _dieResolution(entities: Container<Entity>, entity: Entity): void {
    entities.remove(entity);
  }

  private _getHitbox(entity: Entity): Hitbox {
    const hitbox = entity.getComponent(SystemComponents.Hitbox);

    if (!hitbox)
      throw new Error(`${entity.type}: ${SystemErrors.DependencyError}`);

    return hitbox;
  }

  private _getOverlap(entity: Entity, other: Entity): Vector {
    const hitbox1 = this._getHitbox(entity);
    const hitbox2 = this._getHitbox(other);
    // calculate overlap between hitbox1 and hitbox2
    const x1 = Math.max(hitbox1.x, hitbox2.x);
    const x2 = Math.min(hitbox1.x + hitbox1.width, hitbox2.x + hitbox2.width);
    const y1 = Math.max(hitbox1.y, hitbox2.y);
    const y2 = Math.min(hitbox1.y + hitbox1.height, hitbox2.y + hitbox2.height);
    // calculate overlap area
    const overlapX = x2 - x1;
    const overlapY = y2 - y1;
    return new Vector(overlapX, overlapY);
  }

  private _getNormal(entity: Entity, other: Entity, overlap: Vector): Vector {
    const entityTransform = entity.getComponent(SystemComponents.Transform);
    const otherTransform = other.getComponent(SystemComponents.Transform);
    if (!entityTransform || !otherTransform) return new Vector(0, 0);
    if (overlap.x < overlap.y) {
      // resolve collision on the x-axis
      return entityTransform.position.x < otherTransform.position.x
        ? new Vector(-1, 0)
        : new Vector(1, 0);
    } else if (overlap.x > overlap.y) {
      // resolve collision on the y-axis
      return entityTransform.position.y < otherTransform.position.y
        ? new Vector(0, -1)
        : new Vector(0, 1);
    } else if (overlap.x === overlap.y) {
      // ... edge case
    }
    return new Vector(0, 0);
  }

  private _slideResolution(entity: Entity): void {
    const collision = entity.getComponent(SystemComponents.Collision);
    if (!collision) return;

    const collisionData = collision.data.get("slide");
    if (!collisionData || !collisionData.length) return;

    const transform = entity.getComponent(SystemComponents.Transform);
    const velocity = entity.getComponent(SystemComponents.Velocity);
    if (!transform || !velocity) return;

    // sort the collision data by area in descending order
    collisionData.sort((a, b) => b.area - a.area);

    const first = collisionData[0];

    const { overlap, normal, area } = first;
    if (area <= 0 && overlap.x <= 0 && overlap.y <= 0) return; // area is negative or zero: no more collision

    transform.position = transform.position.add(overlap.multiply(normal));
    if (normal.x !== 0) velocity.value.x = 0;
    if (normal.y !== 0) velocity.value.y = 0;

    collisionData.shift();

    if (collisionData.length === 0) return;

    collisionData.forEach((data) => {
      const other = data.other;

      const overlap = this._getOverlap(entity, other);
      data.overlap.set(overlap.x, overlap.y);
      data.area = overlap.x * overlap.y;

      const normal = this._getNormal(entity, other, data.overlap);
      data.normal = normal;
    });

    if (collisionData.length) this._slideResolution(entity);
  }

  public update(entities: Container<Entity>): void {
    if (!entities.size) return;

    SystemCache.entities = entities.filter((entity) => {
      return entity.hasComponents(SystemComponents.Collision);
    });
    if (!SystemCache.entities.size) return;

    SystemCache.entities.forEach((entity) => {
      const collision = entity.getComponent(SystemComponents.Collision);
      if (!collision || !collision.data.size) return;

      const { resolvers } = collision;
      resolvers.forEach((resolver) => {
        switch (resolver.type) {
          case "slide":
            this._slideResolution(entity);
            break;

          case "die":
            this._dieResolution(entities, entity);
            break;
        }
      });

      collision.data.clear();
    });

    SystemCache.entities.clear();
  }
}
