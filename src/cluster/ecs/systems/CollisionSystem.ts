import { Container } from "../../core/Container";
import { Entity } from "../../core/Entity";
import { System } from "../../core/System";
import { Store } from "../../core/Store";
import { Components } from "../index";

export class CollisionSystem extends System {
  private _entities: Container<Entity>;

  constructor(entities: Container<Entity>) {
    super();
    this._entities = entities;
  }

  private _canCollide(entity: Entity, other: Entity): boolean {
    const entityCollision = entity.getComponent(Components.Collision);
    const otherCollision = other.getComponent(Components.Collision);

    if (!entityCollision || !otherCollision) return false;

    return (
      (entityCollision.mask & otherCollision.layer &&
        otherCollision.mask & entityCollision.layer) !== 0
    );
  }

  private _testCollision(entity: Entity, other: Entity) {
    const hitbox1 = entity.getComponent(Components.Hitbox);
    const hitbox2 = other.getComponent(Components.Hitbox);

    if (!hitbox1 || !hitbox2) return false;

    return (
      hitbox1.x < hitbox2.x + hitbox2.width &&
      hitbox1.x + hitbox1.width > hitbox2.x &&
      hitbox1.y < hitbox2.y + hitbox2.height &&
      hitbox1.y + hitbox1.height > hitbox2.y
    );
  }

  private _storeCollision(entity: Entity, other: Entity): void {
    const collision = entity.getComponent(Components.Collision);

    if (!collision) return;

    collision.collisions.push({ entity: other });
  }

  update(): void {
    const collidableEntities = this._entities.filter((entity: Entity) =>
      entity.hasComponent(Components.Collision)
    );

    const size = collidableEntities.size;

    if (size < 2) return;

    for (let i = 0; i < size; i++) {
      for (let j = i + 1; j < size; j++) {
        const entity = collidableEntities.at(i);
        const other = collidableEntities.at(j);

        if (!entity || !other) continue;

        if (
          this._canCollide(entity, other) &&
          this._testCollision(entity, other)
        ) {
          // this will store the collision data in both entities as the resolver is
          // processing things one at time
          this._storeCollision(entity, other);
          this._storeCollision(other, entity);
        }
      }
    }
  }
}

export class ResolutionSystem extends System {
  private _entities: Container<Entity>;
  private _store: Store;

  constructor(entities: Container<Entity>, store: Store) {
    super();
    this._entities = entities;
    this._store = store;
  }

  private _dieResolution(entity: Entity): void {
    // if (entity.dead) return;

    const collision = entity.getComponent(Components.Collision);

    if (!collision) return;

    collision.collisions.forEach((collisionData) => {
      const other = collisionData.entity;

      if (!other) return;

      // entity.dead = true;

      const { resolvers } = collision;
      resolvers.forEach((resolver) => {
        const { mask, actions } = resolver;
        const layer = other.getComponent(Components.Collision)?.layer || 0;
        if (mask & layer) {
          actions?.forEach((action) => {
            this._store.dispatch(action.name, action.data);
          });
        }
      });
    });
  }

  update(): void {
    const collidableEntities = this._entities.filter((entity: Entity) =>
      entity.hasComponent(Components.Collision)
    );

    collidableEntities.forEach((entity: Entity) => {
      this._dieResolution(entity);
    });
  }
}
