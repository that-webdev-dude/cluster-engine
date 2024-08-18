import * as Cluster from "../../cluster";
import * as Components from "../components";

/** Collision system
 * @required Collision
 * @emits systemStarted, systemUpdated, systemError
 */
export class CollisionSystem extends Cluster.System {
  constructor() {
    super(["Collision"]);
  }

  private _testCollision(
    entityA: Cluster.Entity,
    entityB: Cluster.Entity
  ): boolean {
    const transformA = entityA.components.get("Transform") as
      | Components.TransformComponent
      | undefined;
    const transformB = entityB.components.get("Transform") as
      | Components.TransformComponent
      | undefined;

    if (!transformA || !transformB) return false;

    const collisionA = entityA.components.get("Collision") as
      | Components.CollisionComponent
      | undefined;
    const collisionB = entityB.components.get("Collision") as
      | Components.CollisionComponent
      | undefined;

    if (!collisionA || !collisionB) return false;

    const positionA = transformA.position;
    const positionB = transformB.position;
    const hitboxA = collisionA.hitbox;
    const hitboxB = collisionB.hitbox;

    return (
      positionA.x < positionB.x + hitboxB.width &&
      positionA.x + hitboxA.width > positionB.x &&
      positionA.y < positionB.y + hitboxB.height &&
      positionA.y + hitboxA.height > positionB.y
    );
  }

  private _storeCollisionData(
    entityA: Cluster.Entity,
    entityB: Cluster.Entity
  ) {
    const collisionA = entityA.components.get("Collision") as
      | Components.CollisionComponent
      | undefined;
    const collisionB = entityB.components.get("Collision") as
      | Components.CollisionComponent
      | undefined;

    const resolversA = collisionA?.resolvers;
    if (!resolversA?.length) return;

    resolversA.forEach((resolverA) => {
      if (collisionB && resolverA.mask & collisionB.layer) {
        const transformA = entityA.components.get("Transform") as
          | Components.TransformComponent
          | undefined;
        const transformB = entityB.components.get("Transform") as
          | Components.TransformComponent
          | undefined;

        if (!transformA || !transformB) return;

        if (!collisionA || !collisionB) return;

        const positionA = transformA.position;
        const positionB = transformB.position;
        const hitboxA = collisionA.hitbox;
        const hitboxB = collisionB.hitbox;

        const x1 = Math.max(positionA.x + hitboxA.x, positionB.x + hitboxB.x);
        const x2 = Math.min(
          positionA.x + hitboxA.x + hitboxA.width,
          positionB.x + hitboxB.x + hitboxB.width
        );
        const y1 = Math.max(positionA.y + hitboxA.y, positionB.y + hitboxB.y);
        const y2 = Math.min(
          positionA.y + hitboxA.y + hitboxA.height,
          positionB.y + hitboxB.y + hitboxB.height
        );

        const overlapX = x2 - x1;
        const overlapY = y2 - y1;

        const overlap = new Cluster.Vector(overlapX, overlapY);

        const normal = new Cluster.Vector(
          overlap.x < overlap.y ? (overlap.x < 0 ? -1 : 1) : 0,
          overlap.x > overlap.y ? (overlap.y < 0 ? -1 : 1) : 0
        );

        const area = overlap.x * overlap.y;

        // const dataA = collisionA.data.get(resolverA.type);
        // if (dataA) {
        //   if (!dataA.some((data) => data.other === entityB)) {
        //     dataA.push({
        //       main: entityA,
        //       other: entityB,
        //       overlap,
        //       normal,
        //       area,
        //     });
        //   }
        // } else {
        //   collisionA.data.set(resolverA.type, [
        //     {
        //       main: entityA,
        //       other: entityB,
        //       overlap,
        //       normal,
        //       area,
        //     },
        //   ]);
        // }
      }
    });
  }

  private _potentialCollision(
    collisionA: Components.CollisionComponent,
    collisionB: Components.CollisionComponent
  ) {
    return (
      collisionA.layer & collisionB.mask || collisionB.layer & collisionA.mask
    );
  }

  update(entities: Set<Cluster.Entity>) {
    if (entities.size <= 1) return;

    this.emit("systemStarted");

    const entitiesArray = Array.from(entities);

    for (let i = 0; i < entities.size; i++) {
      for (let j = i + 1; j < entities.size; j++) {
        const entityA = entitiesArray[i];
        const entityB = entitiesArray[j];

        const collisionA = entityA.components.get("Collision") as
          | Components.CollisionComponent
          | undefined;
        const collisionB = entityB.components.get("Collision") as
          | Components.CollisionComponent
          | undefined;

        if (!collisionA || !collisionB) continue;

        // check if a collision can happen using the layer and mask values
        // if (!this._potentialCollision(collisionA, collisionB)) {
        //   continue;
        // }

        // if (this._testCollision(entityA, entityB)) {
        //   if (collisionA.resolvers.length) {
        //     this._storeCollisionData(entityA, entityB);
        //   }
        //   if (collisionB.resolvers.length) {
        //     this._storeCollisionData(entityB, entityA);
        //   }
        // }
      }

      this.emit("systemUpdated");
    }
  }
}
