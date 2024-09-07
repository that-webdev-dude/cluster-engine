import * as Cluster from "../../../cluster";
import * as Components from "../components";
import * as Types from "../types";
import { store } from "../store";

/** Collision system
 * @required  Transform, Collision
 * @emits entityDestroyed, systemStarted, systemUpdated,
 */
export class CollisionSystem extends Cluster.System {
  private _entityCache: Map<Types.CollisionResolverType, Set<Types.EntityId>>;

  constructor() {
    super(["Transform", "Collision"]);
    this._entityCache = new Map();
  }

  /** returns the secondary collision based on the overlap and area. */
  private _getSecondaryCollision(
    collisions: Types.CollisionData[],
    dominantCollision: Types.CollisionData
  ): Types.CollisionData | null {
    // Filter out the dominant collision from the list
    const remainingCollisions = collisions.filter(
      (collision) => collision !== dominantCollision
    );

    // If no remaining collisions exist, return null
    if (remainingCollisions.length === 0) return null;

    // Initialize the secondary collision as the first remaining collision
    let secondaryCollision = remainingCollisions[0];

    // Iterate through the remaining collisions to find the most significant one
    for (let i = 1; i < remainingCollisions.length; i++) {
      const currentCollision = remainingCollisions[i];

      // First, compare by Y overlap
      if (currentCollision.overlap.x > secondaryCollision.overlap.x) {
        secondaryCollision = currentCollision;
      } else if (currentCollision.overlap.x === secondaryCollision.overlap.x) {
        // If Y overlaps are equal, compare by area
        if (currentCollision.area > secondaryCollision.area) {
          secondaryCollision = currentCollision;
        }
      }
    }

    // Consider additional factors for determining secondary collision in the future,
    // such as velocity, collision priorities, or material properties.

    if (
      secondaryCollision.overlap.y === dominantCollision.overlap.y ||
      secondaryCollision.overlap.x === dominantCollision.overlap.x
    )
      return null;

    return secondaryCollision;
  }

  /** returns the primary collision based on the overlap and area. */
  private _getPrimaryCollision(
    collisions: Types.CollisionData[]
  ): Types.CollisionData | null {
    if (collisions.length === 0) return null;

    let dominantCollision = collisions[0];

    for (let i = 1; i < collisions.length; i++) {
      const currentCollision = collisions[i];

      // First, compare by Y overlap
      if (currentCollision.overlap.y > dominantCollision.overlap.y) {
        dominantCollision = currentCollision;
      } else if (currentCollision.overlap.y === dominantCollision.overlap.y) {
        // If Y overlaps are equal, compare by area
        if (currentCollision.area > dominantCollision.area) {
          dominantCollision = currentCollision;
        }
      }
    }

    return dominantCollision;
  }

  /** processes the resolvers for the collision and caches the entities for later resolution. */
  private _processResolvers(
    resolvers: Types.CollisionResolver[],
    collisionA: Components.CollisionComponent,
    collisionB: Components.CollisionComponent,
    entityA: Cluster.Entity,
    entityB: Cluster.Entity,
    normal: Cluster.Vector,
    overlap: Cluster.Vector
  ) {
    resolvers.forEach((resolver) => {
      if (resolver.mask & collisionB.layer) {
        if (!collisionA.data.has(resolver.type)) {
          collisionA.data.set(resolver.type, []);
        }
        collisionA.data.get(resolver.type)?.push({
          entity: entityB,
          overlap,
          normal: normal,
          area: overlap.x * overlap.y,
          events: resolver.events,
          actions: resolver.actions,
        });

        // cache the entity ids for later resolution
        if (!this._entityCache.has(resolver.type)) {
          this._entityCache.set(resolver.type, new Set());
        }
        this._entityCache.get(resolver.type)?.add(entityA.id);
      }
    });
  }

  /** dispatches a store action based on the collision resolver. */
  private _dispatchStoreAction(action: { name: string; payload: any }) {
    store.dispatch(action.name, action.payload);
  }

  /** emits a store event based on the collision resolver. */
  private _emitStoreEvent(event: Cluster.Event) {
    store.emit(event);
  }

  /** determines the direction of the collision normal based on the overlap. It compares the overlap in both axes and returns a vector pointing in the direction of the collision. */
  private _getCollisionNormal(
    positionA: Cluster.Vector,
    positionB: Cluster.Vector,
    overlap: { x: number; y: number }
  ): Cluster.Vector {
    // Assumption: Collision normal is determined based on the axis with the smaller overlap.
    // This is a common assumption for AABB collisions but may not hold for other collision types.
    if (overlap.x < overlap.y) {
      return new Cluster.Vector(positionA.x < positionB.x ? -1 : 1, 0);
    } else {
      return new Cluster.Vector(0, positionA.y < positionB.y ? -1 : 1);
    }
  }

  /**calculates the overlap between the two entities along both the x and y axes. */
  private _getCollisionOverlap(
    positionA: Cluster.Vector,
    hitboxA: Types.CollisionHitbox,
    positionB: Cluster.Vector,
    hitboxB: Types.CollisionHitbox
  ): Cluster.Vector {
    const overlapX = Math.max(
      0,
      Math.min(positionA.x + hitboxA.width, positionB.x + hitboxB.width) -
        Math.max(positionA.x, positionB.x)
    );
    const overlapY = Math.max(
      0,
      Math.min(positionA.y + hitboxA.height, positionB.y + hitboxB.height) -
        Math.max(positionA.y, positionB.y)
    );

    // Note: This logic assumes axis-aligned bounding boxes (AABBs).
    // If you need to handle rotated bounding boxes or other shapes,
    // this method will need to be extended.
    return new Cluster.Vector(overlapX, overlapY);
  }

  /** handles the sleep resolution making the entity inactive and emitting an event */
  // private _handleSleepResolution(
  //   entity: Cluster.Entity,
  //   resolvers: Types.CollisionResolver[],
  //   targetLayer: number
  // ) {
  //   const sleepResolverA = resolvers.find(
  //     (resolver) => resolver.type === "sleep"
  //   );
  //   if (sleepResolverA && sleepResolverA.mask & targetLayer) {
  //     entity.active = false;
  //   }
  // }

  /* handles the die resolution, marking the entity as dead and emitting an event. */
  // private _handleDieResolution(
  //   entity: Cluster.Entity,
  //   resolvers: Types.CollisionResolver[],
  //   targetLayer: number
  // ) {
  //   const dieResolverA = resolvers.find((resolver) => resolver.type === "die");
  //   if (dieResolverA && dieResolverA.mask & targetLayer) {
  //     entity.dead = true;
  //   }
  // }

  /** checks if two entities are colliding by comparing their positions and hitboxes. */
  private _testCollision(
    positionA: Cluster.Vector,
    hitboxA: Types.CollisionHitbox,
    positionB: Cluster.Vector,
    hitboxB: Types.CollisionHitbox
  ): boolean {
    return (
      positionA.x < positionB.x + hitboxB.width &&
      positionA.x + hitboxA.width > positionB.x &&
      positionA.y < positionB.y + hitboxB.height &&
      positionA.y + hitboxA.height > positionB.y
    );
  }

  /** checks if two entities can collide based on their layer and mask values. */
  private _validCollision(
    collisionA: Components.CollisionComponent,
    collisionB: Components.CollisionComponent
  ) {
    return (
      collisionA.layer & collisionB.mask ||
      (collisionB.layer & collisionA.mask &&
        collisionA.detectable &&
        collisionB.detectable)
    );
  }

  /** Update method which orchestrates the entire collision detection and resolution process. */
  update(entities: Set<Cluster.Entity>, dt: number, t: number) {
    if (entities.size <= 1) return;

    const activeEntities = Array.from(entities).filter(
      (entity) => !entity.dead && entity.active
    );

    for (let i = 0; i < activeEntities.length; i++) {
      for (let j = i + 1; j < activeEntities.length; j++) {
        const entityA = activeEntities[i];
        const entityB = activeEntities[j];

        const collisionA =
          entityA.get<Components.CollisionComponent>("Collision");
        const collisionB =
          entityB.get<Components.CollisionComponent>("Collision");

        if (!collisionA || !collisionB) continue;

        // check if a collision can happen using the layer and mask values
        if (!this._validCollision(collisionA, collisionB)) {
          continue;
        }

        const hitboxA = collisionA.hitbox;
        const hitboxB = collisionB.hitbox;

        const positionA =
          entityA.get<Components.TransformComponent>("Transform")?.position;
        const positionB =
          entityB.get<Components.TransformComponent>("Transform")?.position;

        if (!positionA || !positionB) continue;

        // if an actual collision is detected
        if (this._testCollision(positionA, hitboxA, positionB, hitboxB)) {
          // emit the entity-hit event?

          // no need to resolve collisions if one or both entities are dead

          // no need to resolve collisions if one or both entities are inactive

          // no need to resolve collisions if there are no resolvers
          const resolversA = collisionA.resolvers;
          const resolversB = collisionB.resolvers;

          if (resolversA.length === 0 && resolversB.length === 0) continue;

          // at this point we start collecting data
          const overlap = this._getCollisionOverlap(
            positionA,
            hitboxA,
            positionB,
            hitboxB
          );

          if (resolversA.length) {
            const normalA = this._getCollisionNormal(
              positionA,
              positionB,
              overlap
            );
            this._processResolvers(
              resolversA,
              collisionA,
              collisionB,
              entityA,
              entityB,
              normalA,
              overlap
            );
          }

          if (resolversB.length) {
            const normalB = this._getCollisionNormal(
              positionB,
              positionA,
              overlap
            );
            this._processResolvers(
              resolversB,
              collisionB,
              collisionA,
              entityB,
              entityA,
              normalB,
              overlap
            );
          }
        }
      }
    }

    // resolve the collisions
    this._entityCache.forEach((entityIds, resolverType) => {
      const resolutionEntities = activeEntities.filter((entity) => {
        return entityIds.has(entity.id);
      });

      resolutionEntities.forEach((entity) => {
        const collision =
          entity.get<Components.CollisionComponent>("Collision");

        const transform =
          entity.get<Components.TransformComponent>("Transform");

        if (!collision || !transform) return;

        const data = collision.data.get(resolverType);
        if (!data || data.length === 0) return;

        // here first we separate the entities
        // then we resolve the collision for each entity
        const primaryCollision = this._getPrimaryCollision(data);
        if (!primaryCollision) return;

        let totalAdjustmentX =
          primaryCollision.normal.x * primaryCollision.overlap.x;
        let totalAdjustmentY =
          primaryCollision.normal.y * primaryCollision.overlap.y;

        // note: this is a simple resolution method that only considers the primary collision.
        // In a more complex system, you may want to consider multiple collisions
        // and resolve them in order of significance.
        const secondaryCollision = this._getSecondaryCollision(
          data,
          primaryCollision
        );
        if (secondaryCollision) {
          totalAdjustmentX +=
            secondaryCollision.normal.x * secondaryCollision.overlap.x;
          totalAdjustmentY +=
            secondaryCollision.normal.y * secondaryCollision.overlap.y;
        }

        transform.position.x += totalAdjustmentX;
        transform.position.y += totalAdjustmentY;

        switch (resolverType) {
          case "bounce":
            const velocity =
              entity.get<Components.VelocityComponent>("Velocity");
            if (!velocity) return;

            if (primaryCollision.normal.x !== 0) {
              velocity.velocity.x *= -1;
            }
            if (primaryCollision.normal.y !== 0) {
              velocity.velocity.y *= -1;
            }
            break;

          case "die":
            entity.dead = true;
            break;

          case "sleep":
            entity.active = false;
            break;

          case "none":
            break;

          default:
            break;
        }

        const events = primaryCollision.events;
        if (events) {
          events.forEach((event) => {
            this._emitStoreEvent(event);
          });
        }

        const actions = primaryCollision.actions;
        if (actions) {
          actions.forEach((action) => {
            this._dispatchStoreAction(action);
          });
        }

        collision.data.clear();
      });
    });

    this._entityCache.clear();
  }
}
