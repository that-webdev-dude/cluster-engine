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

  private _processResolvers(
    resolvers: Types.CollisionResolver[],
    collisionA: Components.CollisionComponent,
    collisionB: Components.CollisionComponent,
    entityA: Cluster.Entity,
    entityB: Cluster.Entity,
    normal: Cluster.Vector,
    vector: Cluster.Vector,
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
          vector,
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

  private _dispatchStoreAction(action: { name: string; payload: any }) {
    store.dispatch(action.name, action.payload);
  }

  private _emitStoreEvent(event: Cluster.Event) {
    store.emit(event);
  }

  private _getCollisionVector(
    hitboundsA: Types.CollisionHitbox,
    hitboundsB: Types.CollisionHitbox
  ) {
    const centerA = new Cluster.Vector(
      hitboundsA.x + hitboundsA.width / 2,
      hitboundsA.y + hitboundsA.height / 2
    );
    const centerB = new Cluster.Vector(
      hitboundsB.x + hitboundsB.width / 2,
      hitboundsB.y + hitboundsB.height / 2
    );
    return centerA.subtract(centerB);
  }

  private _getCollisionNormal(
    hitboundsA: Types.CollisionHitbox,
    hitboundsB: Types.CollisionHitbox,
    overlap: { x: number; y: number }
  ): Cluster.Vector {
    // Assumption: Collision normal is determined based on the axis with the smaller overlap.
    // This is a common assumption for AABB collisions but may not hold for other collision types.
    if (overlap.x < overlap.y) {
      return new Cluster.Vector(hitboundsA.x < hitboundsB.x ? -1 : 1, 0);
    } else {
      return new Cluster.Vector(0, hitboundsA.y < hitboundsB.y ? -1 : 1);
    }
  }

  private _getCollisionOverlap(
    hitboundsA: Types.CollisionHitbox,
    hitboundsB: Types.CollisionHitbox
  ): Cluster.Vector {
    const overlapX = Math.max(
      0,
      Math.min(
        hitboundsA.x + hitboundsA.width,
        hitboundsB.x + hitboundsB.width
      ) - Math.max(hitboundsA.x, hitboundsB.x)
    );
    const overlapY = Math.max(
      0,
      Math.min(
        hitboundsA.y + hitboundsA.height,
        hitboundsB.y + hitboundsB.height
      ) - Math.max(hitboundsA.y, hitboundsB.y)
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

  private _testCollision(
    hitboundsA: Types.CollisionHitbox,
    hitboundsB: Types.CollisionHitbox
  ): boolean {
    return (
      hitboundsA.x < hitboundsB.x + hitboundsB.width &&
      hitboundsA.x + hitboundsA.width > hitboundsB.x &&
      hitboundsA.y < hitboundsB.y + hitboundsB.height &&
      hitboundsA.y + hitboundsA.height > hitboundsB.y
    );
  }

  private _getHitbounds(
    position: Cluster.Vector,
    hitbox: { x: number; y: number; width: number; height: number }
  ) {
    return {
      x: position.x + hitbox.x,
      y: position.y + hitbox.y,
      width: hitbox.width,
      height: hitbox.height,
    };
  }

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

        const hitboundsA = this._getHitbounds(positionA, hitboxA);
        const hitboundsB = this._getHitbounds(positionB, hitboxB);

        // if an actual collision is detected
        if (this._testCollision(hitboundsA, hitboundsB)) {
          // emit the entity-hit event?

          // no need to resolve collisions if there are no resolvers
          const resolversA = collisionA.resolvers;
          const resolversB = collisionB.resolvers;

          if (resolversA.length === 0 && resolversB.length === 0) continue;

          // at this point we start collecting data
          const overlap = this._getCollisionOverlap(hitboundsA, hitboundsB);

          if (resolversA.length) {
            const vectorA = this._getCollisionVector(hitboundsA, hitboundsB);
            const normalA = this._getCollisionNormal(
              hitboundsA,
              hitboundsB,
              overlap
            );
            this._processResolvers(
              resolversA,
              collisionA,
              collisionB,
              entityA,
              entityB,
              normalA,
              vectorA,
              overlap
            );
          }

          if (resolversB.length) {
            const vectorB = this._getCollisionVector(hitboundsB, hitboundsA);
            const normalB = this._getCollisionNormal(
              hitboundsB,
              hitboundsA,
              overlap
            );

            // here
            // const centerA = new Cluster.Vector(
            //   hitboundsA.x + hitboundsA.width / 2,
            //   hitboundsA.y + hitboundsA.height / 2
            // );
            // const centerB = new Cluster.Vector(
            //   hitboundsB.x + hitboundsB.width / 2,
            //   hitboundsB.y + hitboundsB.height / 2
            // );
            // const collisionVector = centerA.subtract(centerB).normalize();
            // console.log(collisionVector);

            this._processResolvers(
              resolversB,
              collisionB,
              collisionA,
              entityB,
              entityA,
              normalB,
              vectorB,
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
              const vx = Cluster.Cmath.clamp(
                primaryCollision.vector.normalize().x,
                -0.5,
                0.5
              );
              velocity.velocity.x = vx;
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
