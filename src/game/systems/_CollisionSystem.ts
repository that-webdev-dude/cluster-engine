import { store } from "../store";
import * as Cluster from "../../cluster";
import * as Components from "../components";

type EntityId = number;
type ResolverType = Components.CollisionResolverType;

/** Collision system
 * @required Collision
 * @emits systemStarted, systemUpdated, systemError
 */
export class CollisionSystem extends Cluster.System {
  private _entityCache: Map<ResolverType, Set<EntityId>>;

  constructor() {
    super(["Transform", "Collision"]);
    this._entityCache = new Map();
  }

  /** returns the secondary collision based on the overlap and area. */
  private _getSecondaryCollision(
    collisions: Components.ICollisionData[],
    dominantCollision: Components.ICollisionData
  ): Components.ICollisionData | null {
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
    collisions: Components.ICollisionData[]
  ): Components.ICollisionData | null {
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
    resolvers: Components.ICollisionResolver[],
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
          normal: normal,
          overlap,
          area: overlap.x * overlap.y,
        });

        // cache the entity ids for later resolution
        if (!this._entityCache.has(resolver.type)) {
          this._entityCache.set(resolver.type, new Set());
        }
        this._entityCache.get(resolver.type)?.add(entityA.id);
      }
    });
  }

  /** emits the store events specified in the collision resolver. */
  private _dispatchStoreEvent(resolver: Components.ICollisionResolver) {
    const { actions } = resolver;
    if (actions) {
      actions.forEach((action) => {
        store.dispatch(action.action, action.payload);
      });
    }
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
    hitboxA: Components.ICollisionHitbox,
    positionB: Cluster.Vector,
    hitboxB: Components.ICollisionHitbox
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
  private _handleSleepResolution(
    entity: Cluster.Entity,
    resolvers: Components.ICollisionResolver[]
  ) {
    const sleepResolverA = resolvers.find(
      (resolver) => resolver.type === "sleep"
    );
    if (sleepResolverA) {
      entity.active = false;
      this._dispatchStoreEvent(sleepResolverA);
    }
  }

  /* handles the die resolution, marking the entity as dead and emitting an event. */
  private _handleDieResolution(
    entity: Cluster.Entity,
    resolvers: Components.ICollisionResolver[]
  ) {
    const dieResolverA = resolvers.find((resolver) => resolver.type === "die");
    if (dieResolverA) {
      entity.dead = true;
      this.emit("entityDestroyed", entity.id);
      this._dispatchStoreEvent(dieResolverA);
    }
  }

  /** checks if two entities are colliding by comparing their positions and hitboxes. */
  private _testCollision(
    positionA: Cluster.Vector,
    hitboxA: Components.ICollisionHitbox,
    positionB: Cluster.Vector,
    hitboxB: Components.ICollisionHitbox
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
      collisionA.layer & collisionB.mask || collisionB.layer & collisionA.mask
    );
  }

  /** Update method which orchestrates the entire collision detection and resolution process. */
  update(entities: Set<Cluster.Entity>, dt: number, t: number) {
    if (entities.size <= 1) return;

    this.emit("systemStarted");

    const activeEntities = Array.from(entities).filter(
      (entity) => !entity.dead && entity.active
    );

    for (let i = 0; i < activeEntities.length; i++) {
      for (let j = i + 1; j < activeEntities.length; j++) {
        const entityA = activeEntities[i];
        const entityB = activeEntities[j];

        // if (entityA.dead || entityB.dead || !entityA.active || !entityB.active)
        //   continue;

        const collisionA =
          entityA.get<Components.CollisionComponent>("Collision");
        const collisionB =
          entityB.get<Components.CollisionComponent>("Collision");

        // check if a collision can happen using the layer and mask values
        if (!this._validCollision(collisionA, collisionB)) {
          continue;
        }

        const transformA =
          entityA.get<Components.TransformComponent>("Transform");
        const transformB =
          entityB.get<Components.TransformComponent>("Transform");

        // if an actual collision is detected
        if (
          this._testCollision(
            transformA.position,
            collisionA.hitbox,
            transformB.position,
            collisionB.hitbox
          )
        ) {
          // no need to resolve collisions if one or both entities are dead
          this._handleDieResolution(entityA, collisionA.resolvers);
          this._handleDieResolution(entityB, collisionB.resolvers);

          if (entityA.dead || entityB.dead) continue;

          // no need to resolve collisions if one or both entities are inactive
          this._handleSleepResolution(entityA, collisionA.resolvers);
          this._handleSleepResolution(entityB, collisionB.resolvers);

          if (!entityA.active || !entityB.active) continue;

          const resolversA = collisionA.resolvers;
          const resolversB = collisionB.resolvers;

          if (resolversA.length === 0 && resolversB.length === 0) continue;

          // console.log("Collision detected");

          // at this point we start collecting data
          const overlap = this._getCollisionOverlap(
            transformA.position,
            collisionA.hitbox,
            transformB.position,
            collisionB.hitbox
          );

          if (resolversA) {
            const normalA = this._getCollisionNormal(
              transformA.position,
              transformB.position,
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

          if (resolversB) {
            const normalB = this._getCollisionNormal(
              transformB.position,
              transformA.position,
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
      const resolutionEntities = activeEntities.filter((entity) =>
        entityIds.has(entity.id)
      );

      resolutionEntities.forEach((entity) => {
        const collision =
          entity.get<Components.CollisionComponent>("Collision");

        const data = collision.data.get(resolverType);

        if (!data || data.length === 0) return;

        const primaryCollision = this._getPrimaryCollision(data);
        if (!primaryCollision) return;

        const transform =
          entity.get<Components.TransformComponent>("Transform");

        transform.position.x +=
          primaryCollision.normal.x * primaryCollision.overlap.x;
        transform.position.y +=
          primaryCollision.normal.y * primaryCollision.overlap.y;

        const secondaryCollision = this._getSecondaryCollision(
          data!,
          primaryCollision!
        );

        if (secondaryCollision) {
          transform.position.x +=
            secondaryCollision.normal.x * secondaryCollision.overlap.x;
          transform.position.y +=
            secondaryCollision.normal.y * secondaryCollision.overlap.y;
        }

        collision.data.clear();
      });

      this._entityCache.clear();
    });

    this.emit("systemUpdated");
  }
}
