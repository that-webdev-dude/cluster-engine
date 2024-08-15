import * as Cluster from "../../cluster";
import * as Components from "../components";
import { store } from "../store";

interface SpawnStrategy<T extends Cluster.Entity> {
  spawn(pool: Cluster.Pool<T>, owner: Cluster.Entity): T | undefined;
}

class EnemySpawn<T extends Cluster.Entity> implements SpawnStrategy<T> {
  spawn(pool: Cluster.Pool<T>, owner: Cluster.Entity) {
    let positionX = store.get("screenWidth");
    let positionY = Cluster.Cmath.rand(16, store.get("screenHeight") - 64 - 16);

    const entity = pool.next();
    const entityTransform = entity.components.get("Transform") as
      | Components.TransformComponent
      | undefined;
    if (entityTransform) {
      entityTransform.position.x = positionX;
      entityTransform.position.y = positionY;
    }
    entity.active = true;
    return entity;
  }
}

class BulletSpawn<T extends Cluster.Entity> implements SpawnStrategy<T> {
  spawn(pool: Cluster.Pool<T>, owner: Cluster.Entity) {
    let bulletPositionX = 0;
    let bulletPositionY = 0;
    if (owner.components.has("Player")) {
      const ownerTransform = owner.components.get("Transform") as
        | Components.TransformComponent
        | undefined;
      const ownerController = owner.components.get("Controller") as
        | Components.ControllerComponent
        | undefined;

      if (!ownerTransform) return;
      bulletPositionX = ownerTransform.position.x + 64;
      bulletPositionY = ownerTransform.position.y + 32 - 6;

      if (!ownerController) return;
      if (ownerController.action) {
        const entity = pool.next();
        const entityTransform = entity.components.get("Transform") as
          | Components.TransformComponent
          | undefined;
        if (entityTransform) {
          entityTransform.position.x = bulletPositionX;
          entityTransform.position.y = bulletPositionY;
        }
        entity.active = true;
        return entity;
      }
    }

    if (owner.components.has("Enemy")) {
      const ownerTransform = owner.components.get("Transform") as
        | Components.TransformComponent
        | undefined;

      if (!ownerTransform) return;
      bulletPositionX = ownerTransform.position.x - 64;
      bulletPositionY = ownerTransform.position.y + 32 - 6;

      const entity = pool.next();
      const entityTransform = entity.components.get("Transform") as
        | Components.TransformComponent
        | undefined;
      if (entityTransform) {
        entityTransform.position.x = bulletPositionX;
        entityTransform.position.y = bulletPositionY;
      }
      entity.active = true;
      return entity;
    }

    return undefined;
  }
}

export type SpawnStrategyType = "enemy" | "bullet";
export const SpawnStrategies = new Map<string, SpawnStrategy<Cluster.Entity>>([
  ["enemy", new EnemySpawn()],
  ["bullet", new BulletSpawn()],
]);
