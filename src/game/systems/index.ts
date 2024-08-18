import { store } from "../store";
import * as Cluster from "../../cluster";
import * as Strategies from "../strategies";
import * as Components from "../components";

/** Renderer system
 * @required Transform, Zindex
 * @supports Alpha,  Sprite, Rect, Text
 * @emits systemStarted, systemUpdated, systemError
 */
export class RendererSystem extends Cluster.System {
  private _buffers: Map<number, OffscreenCanvasRenderingContext2D> | null =
    null;
  private _context: CanvasRenderingContext2D | null = null;

  constructor() {
    super(["Transform", "Zindex"]);

    const canvas = document.querySelector("canvas");
    if (!canvas) throw new Error("[Renderer Error] No canvas element found");

    this._context = canvas.getContext("2d");
    this._buffers = new Map();
  }

  private _clear() {
    this._buffers?.forEach((context) => {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    });
    this._context?.clearRect(
      0,
      0,
      this._context.canvas.width,
      this._context.canvas.height
    );
  }

  private _createNewBuffer(zindex: number): OffscreenCanvasRenderingContext2D {
    const offscreenCanvas = new OffscreenCanvas(
      this._context!.canvas.width,
      this._context!.canvas.height
    );
    const context = offscreenCanvas.getContext("2d")!;
    this._buffers?.set(zindex, context);

    // Sort buffers by zindex
    if (this._buffers)
      this._buffers = new Map([...this._buffers].sort((a, b) => a[0] - b[0]));

    return context;
  }

  private _setGlobalAlpha(
    context: OffscreenCanvasRenderingContext2D,
    alpha: number
  ) {
    context.globalAlpha = alpha;
  }

  private _setTransform(
    context: OffscreenCanvasRenderingContext2D,
    transform: Components.TransformComponent
  ) {
    context.translate(
      Math.round(transform.position.x),
      Math.round(transform.position.y)
    );
    context.translate(
      Math.round(transform.anchor.x),
      Math.round(transform.anchor.y)
    );
    context.scale(transform.scale.x, transform.scale.y);

    context.translate(transform.pivot.x, transform.pivot.y);
    context.rotate(Cluster.Cmath.deg2rad(transform.angle));
    context.translate(-transform.pivot.x, -transform.pivot.y);
  }

  private _renderEntity(
    context: OffscreenCanvasRenderingContext2D,
    entity: Cluster.Entity
  ) {
    const rect = entity.components.get("Rect") as
      | Components.RectComponent
      | undefined;
    const text = entity.components.get("Text") as
      | Components.TextComponent
      | undefined;
    const sprite = entity.components.get("Sprite") as
      | Components.SpriteComponent
      | undefined;

    if (rect) {
      context.fillStyle = rect.fill;
      context.strokeStyle = rect.stroke;
      context.fillRect(0, 0, rect.width, rect.height);
      context.strokeRect(0, 0, rect.width, rect.height);
    }
    if (text) {
      context.fillStyle = text.fill;
      context.font = text.font;
      context.fillText(text.text, 0, 0);
    }
    if (sprite) {
      const { x, y } = sprite.indexToCoords;
      context.drawImage(
        sprite.image,
        x,
        y,
        sprite.width,
        sprite.height,
        0,
        0,
        sprite.width,
        sprite.height
      );

      //debug
      const collision = entity.components.get("Collision") as
        | Components.CollisionComponent
        | undefined;
      if (collision) {
        const hitbox = collision.hitbox;
        context.strokeStyle = "yellow";
        context.strokeRect(0, 0, hitbox.width, hitbox.height);
      }
    }
  }

  update(entities: Set<Cluster.Entity>) {
    if (entities.size === 0) return;

    // const start = performance.now(); // debug

    this.emit("systemStarted");

    this._clear();

    for (let entity of entities) {
      try {
        if (entity.dead || !entity.active) continue;

        const alpha = entity.components.get("Alpha") as
          | Components.AlphaComponent
          | undefined;
        if (alpha && alpha.alpha === 0) continue;

        const zindex = entity.components.get("Zindex") as
          | Components.ZindexComponent
          | undefined;
        if (zindex) {
          let context = this._buffers?.get(zindex.zindex);

          if (!context) context = this._createNewBuffer(zindex.zindex);

          context.save();

          if (alpha) this._setGlobalAlpha(context, alpha.alpha);
          const transform = entity.components.get("Transform") as
            | Components.TransformComponent
            | undefined;
          if (transform) this._setTransform(context, transform);

          this._renderEntity(context, entity);

          context.restore();
        }
      } catch (error) {
        this.emit("systemError", error);
      }

      // const end = performance.now(); // debug
      // console.log(`RendererSystem: ${(end - start).toPrecision(2)}ms`); // debug
    }

    this._buffers?.forEach((context) => {
      this._context?.drawImage(context.canvas, 0, 0);
    });

    this.emit("systemUpdated");
  }
}

/** Input system
 * @required Player, Controller, Velocity
 * @emits systemStarted, systemUpdated, systemError
 */
export class InputSystem extends Cluster.System {
  constructor() {
    super(["Player", "Controller", "Velocity"]);
  }

  update(entities: Set<Cluster.Entity>) {
    if (entities.size === 0) return;

    // const start = performance.now(); // debug

    this.emit("systemStarted");

    for (let entity of entities) {
      if (entity.dead || !entity.active) continue;

      try {
        const playerComponent = entity.components.get("Player") as
          | Components.PlayerComponent
          | undefined;
        const controllerComponent = entity.components.get("Controller") as
          | Components.ControllerComponent
          | undefined;
        const velocityComponent = entity.components.get("Velocity") as
          | Components.VelocityComponent
          | undefined;

        if (playerComponent && controllerComponent && velocityComponent) {
          const { velocity } = velocityComponent;
          const { speed } = playerComponent;

          velocity.x = controllerComponent.direction.x * speed;
          velocity.y = controllerComponent.direction.y * speed;
        }
      } catch (error) {
        this.emit("systemError", error);
      }
    }

    this.emit("systemUpdated");

    // const end = performance.now(); // debug
    // console.log(`InputSystem: ${end - start}ms`); // debug
  }
}

/** Motion system
 * @required Transform, Velocity,
 * @supports Physics
 * @emits systemStarted, systemUpdated, systemError
 */
export class MotionSystem extends Cluster.System {
  constructor() {
    super(["Transform", "Velocity"]);
  }

  // motion modules here

  update(entities: Set<Cluster.Entity>, dt: number) {
    if (entities.size === 0) return;

    this.emit("systemStarted");

    for (let entity of entities) {
      if (entity.dead || !entity.active) continue;

      try {
        const transformComponent = entity.components.get("Transform") as
          | Components.TransformComponent
          | undefined;
        const velocityComponent = entity.components.get("Velocity") as
          | Components.VelocityComponent
          | undefined;

        if (transformComponent && velocityComponent) {
          const { position } = transformComponent;
          const { velocity } = velocityComponent;

          let accelerationX = 0;
          let accelerationY = 0;

          // if has a physics component get the acceleration values
          // then reset the acceleration vector to 0

          let vx = velocity.x + accelerationX * dt;
          let vy = velocity.y + accelerationY * dt;

          let dx = ((velocity.x + vx) / 2) * dt;
          let dy = ((velocity.y + vy) / 2) * dt;
          position.x += dx;
          position.y += dy;

          velocity.x = vx;
          velocity.y = vy;
        }
      } catch (error) {
        this.emit("systemError", error);
      }
    }

    this.emit("systemUpdated");
  }
}

/** Boundary system
 * @required Transform,
 * @emits systemStarted, systemUpdated, systemError
 */
export class BoundarySystem extends Cluster.System {
  private _screenHeight: number;
  private _screenWidth: number;

  constructor() {
    super(["Transform"]);

    const display = document.querySelector("canvas");
    if (!display) throw new Error("[BoundarySystem Error] No display found");

    this._screenHeight = display.height;
    this._screenWidth = display.width;
  }

  private _contain(position: Cluster.Vector, width: number, height: number) {
    let maxX = this._screenWidth - width;
    let maxY = this._screenHeight - height;
    position.x = Cluster.Cmath.clamp(position.x, 0, maxX);
    position.y = Cluster.Cmath.clamp(position.y, 0, maxY);
  }

  private _wrap(position: Cluster.Vector, width: number, height: number) {
    let maxX = this._screenWidth;
    let maxY = this._screenHeight;
    if (position.x > maxX) {
      position.x = -width;
    } else if (position.x < -width) {
      position.x = maxX;
    }

    if (position.y > maxY) {
      position.y = -height;
    } else if (position.y < -height) {
      position.y = maxY;
    }
  }

  update(entities: Set<Cluster.Entity>) {
    if (entities.size === 0) return;

    this.emit("systemStarted");

    for (let entity of entities) {
      if (entity.dead || !entity.active) continue;

      try {
        const transformComponent = entity.components.get("Transform") as
          | Components.TransformComponent
          | undefined;

        if (transformComponent) {
          const { position, boundary } = transformComponent;

          // get the width and height of the entity
          let width = 0;
          let height = 0;
          if (entity.components.has("Rect")) {
            const rectComponent = entity.components.get("Rect") as
              | Components.RectComponent
              | undefined;
            if (rectComponent) {
              width = rectComponent.width;
              height = rectComponent.height;
            }
          } else if (entity.components.has("Sprite")) {
            const spriteComponent = entity.components.get("Sprite") as
              | Components.SpriteComponent
              | undefined;
            if (spriteComponent) {
              width = spriteComponent.width;
              height = spriteComponent.height;
            }
          }

          switch (boundary) {
            case "contain":
              this._contain(position, width, height);
              break;
            case "wrap":
              this._wrap(position, width, height);
              break;
            case "sleep":
              if (
                position.x > this._screenWidth ||
                position.x < -width ||
                position.y > this._screenHeight ||
                position.y < -height
              ) {
                entity.active = false;
              }
              break;
            case "die":
              if (
                position.x > this._screenWidth ||
                position.x < -width ||
                position.y > this._screenHeight ||
                position.y < -height
              ) {
                this.emit("entityDestroyed", entity.id);
              }
              break;
            default:
              break;
          }
        }
      } catch (error) {
        this.emit("systemError", error);
      }
    }

    this.emit("systemUpdated");
  }
}

/** Spawn system
 * @required Spawn
 * @emits systemStarted, systemUpdated, systemError
 */
export class SpawnSystem extends Cluster.System {
  constructor() {
    super(["Spawner"]);
  }

  update(entities: Set<Cluster.Entity>, dt?: number, t?: number) {
    if (entities.size === 0) return;

    this.emit("systemStarted");

    for (let entity of entities) {
      try {
        const spawnComponent = entity.components.get("Spawner") as
          | Components.SpawnerComponent
          | undefined;

        if (spawnComponent) {
          if (
            spawnComponent.limit !== 0 &&
            spawnComponent.count >= spawnComponent.limit
          ) {
            continue; // limit reached. don't spawn
          }

          const { strategy, pool } = spawnComponent;
          const spawnStrategy = Strategies.SpawnStrategies.get(strategy);
          if (!spawnStrategy) {
            throw new Error(
              `[SpawnSystem Error] No strategy found for ${strategy}`
            );
          } else {
            if (spawnComponent.timer <= 0) {
              spawnComponent.timer = spawnComponent.interval;
              const spawned = spawnStrategy.spawn(pool, entity);
              if (spawned) {
                spawnComponent.count++;
                this.emit("entityCreated", spawned);
              }
            } else {
              spawnComponent.timer -= dt!;
            }
          }
        }
      } catch (error) {
        this.emit("systemError", error);
      }
    }

    this.emit("systemUpdated");
  }
}

// /** Collision system
//  * @required Collision
//  * @emits systemStarted, systemUpdated, systemError
//  */
// export class CollisionSystem extends Cluster.System {
//   constructor() {
//     super(["Collision"]);
//   }

//   private _testCollision(
//     entityA: Cluster.Entity,
//     entityB: Cluster.Entity
//   ): boolean {
//     const transformA = entityA.components.get("Transform") as
//       | Components.TransformComponent
//       | undefined;
//     const transformB = entityB.components.get("Transform") as
//       | Components.TransformComponent
//       | undefined;

//     if (!transformA || !transformB) return false;

//     const collisionA = entityA.components.get("Collision") as
//       | Components.CollisionComponent
//       | undefined;
//     const collisionB = entityB.components.get("Collision") as
//       | Components.CollisionComponent
//       | undefined;

//     if (!collisionA || !collisionB) return false;

//     const positionA = transformA.position;
//     const positionB = transformB.position;
//     const hitboxA = collisionA.hitbox;
//     const hitboxB = collisionB.hitbox;

//     return (
//       positionA.x < positionB.x + hitboxB.width &&
//       positionA.x + hitboxA.width > positionB.x &&
//       positionA.y < positionB.y + hitboxB.height &&
//       positionA.y + hitboxA.height > positionB.y
//     );
//   }

//   private _storeCollisionData(
//     entityA: Cluster.Entity,
//     entityB: Cluster.Entity
//   ) {
//     const collisionA = entityA.components.get("Collision") as
//       | Components.CollisionComponent
//       | undefined;
//     const collisionB = entityB.components.get("Collision") as
//       | Components.CollisionComponent
//       | undefined;

//     const resolversA = collisionA?.resolvers;
//     if (!resolversA?.length) return;

//     resolversA.forEach((resolverA) => {
//       if (collisionB && resolverA.mask & collisionB.layer) {
//         const transformA = entityA.components.get("Transform") as
//           | Components.TransformComponent
//           | undefined;
//         const transformB = entityB.components.get("Transform") as
//           | Components.TransformComponent
//           | undefined;

//         if (!transformA || !transformB) return;

//         if (!collisionA || !collisionB) return;

//         const positionA = transformA.position;
//         const positionB = transformB.position;
//         const hitboxA = collisionA.hitbox;
//         const hitboxB = collisionB.hitbox;

//         const x1 = Math.max(positionA.x + hitboxA.x, positionB.x + hitboxB.x);
//         const x2 = Math.min(
//           positionA.x + hitboxA.x + hitboxA.width,
//           positionB.x + hitboxB.x + hitboxB.width
//         );
//         const y1 = Math.max(positionA.y + hitboxA.y, positionB.y + hitboxB.y);
//         const y2 = Math.min(
//           positionA.y + hitboxA.y + hitboxA.height,
//           positionB.y + hitboxB.y + hitboxB.height
//         );

//         const overlapX = x2 - x1;
//         const overlapY = y2 - y1;

//         const overlap = new Cluster.Vector(overlapX, overlapY);

//         const normal = new Cluster.Vector(
//           overlap.x < overlap.y ? (overlap.x < 0 ? -1 : 1) : 0,
//           overlap.x > overlap.y ? (overlap.y < 0 ? -1 : 1) : 0
//         );

//         const area = overlap.x * overlap.y;

//         // const dataA = collisionA.data.get(resolverA.type);
//         // if (dataA) {
//         //   if (!dataA.some((data) => data.other === entityB)) {
//         //     dataA.push({
//         //       main: entityA,
//         //       other: entityB,
//         //       overlap,
//         //       normal,
//         //       area,
//         //     });
//         //   }
//         // } else {
//         //   collisionA.data.set(resolverA.type, [
//         //     {
//         //       main: entityA,
//         //       other: entityB,
//         //       overlap,
//         //       normal,
//         //       area,
//         //     },
//         //   ]);
//         // }
//       }
//     });
//   }

//   private _potentialCollision(
//     collisionA: Components.CollisionComponent,
//     collisionB: Components.CollisionComponent
//   ) {
//     return (
//       collisionA.layer & collisionB.mask || collisionB.layer & collisionA.mask
//     );
//   }

//   update(entities: Set<Cluster.Entity>) {
//     if (entities.size <= 1) return;

//     // const start = performance.now(); // debug

//     this.emit("systemStarted");

//     const entitiesArray = Array.from(entities);

//     for (let i = 0; i < entities.size; i++) {
//       for (let j = i + 1; j < entities.size; j++) {
//         const entityA = entitiesArray[i];
//         const entityB = entitiesArray[j];

//         const collisionA = entityA.components.get("Collision") as
//           | Components.CollisionComponent
//           | undefined;
//         const collisionB = entityB.components.get("Collision") as
//           | Components.CollisionComponent
//           | undefined;

//         if (!collisionA || !collisionB) continue;

//         // check if a collision can happen using the layer and mask values
//         if (!this._potentialCollision(collisionA, collisionB)) {
//           continue;
//         }

//         if (this._testCollision(entityA, entityB)) {
//           if (collisionA.resolvers.length) {
//             this._storeCollisionData(entityA, entityB);
//           }
//           if (collisionB.resolvers.length) {
//             this._storeCollisionData(entityB, entityA);
//           }
//         }
//       }

//       this.emit("systemUpdated");

//       // const end = performance.now(); // debug
//       // console.log(`CollisionSystem: ${(end - start).toFixed(2)}ms`); // debug
//     }
//   }
// }

// /** Resolution system
//  * @required Collision, Transform, Velocity
//  * @emits systemStarted, systemUpdated, systemError, entityDestroyed
//  */
// export class ResolutionSystem extends Cluster.System {
//   // private _getOverlap(entityA: Cluster.Entity, entityB: Cluster.Entity) {
//   //   const transformA = entityA.components.get("Transform") as
//   //     | Components.TransformComponent
//   //     | undefined;
//   //   const transformB = entityB.components.get("Transform") as
//   //     | Components.TransformComponent
//   //     | undefined;

//   //   if (!transformA || !transformB) return new Cluster.Vector(0, 0);

//   //   const collisionA = entityA.components.get("Collision") as
//   //     | Components.CollisionComponent
//   //     | undefined;
//   //   const collisionB = entityB.components.get("Collision") as
//   //     | Components.CollisionComponent
//   //     | undefined;

//   //   if (!collisionA || !collisionB) return new Cluster.Vector(0, 0);

//   //   const positionA = transformA.position;
//   //   const positionB = transformB.position;
//   //   const hitboxA = collisionA.hitbox;
//   //   const hitboxB = collisionB.hitbox;

//   //   const x1 = Math.max(positionA.x + hitboxA.x, positionB.x + hitboxB.x);
//   //   const x2 = Math.min(
//   //     positionA.x + hitboxA.x + hitboxA.width,
//   //     positionB.x + hitboxB.x + hitboxB.width
//   //   );
//   //   const y1 = Math.max(positionA.y + hitboxA.y, positionB.y + hitboxB.y);
//   //   const y2 = Math.min(
//   //     positionA.y + hitboxA.y + hitboxA.height,
//   //     positionB.y + hitboxB.y + hitboxB.height
//   //   );

//   //   const overlapX = x2 - x1;
//   //   const overlapY = y2 - y1;

//   //   return new Cluster.Vector(overlapX, overlapY);
//   // }

//   // private _getNormal(
//   //   entityA: Cluster.Entity,
//   //   entityB: Cluster.Entity,
//   //   overlap: Cluster.Vector
//   // ) {
//   //   const transformA = entityA.components.get("Transform") as
//   //     | Components.TransformComponent
//   //     | undefined;
//   //   const transformB = entityB.components.get("Transform") as
//   //     | Components.TransformComponent
//   //     | undefined;

//   //   if (!transformA || !transformB) return new Cluster.Vector(0, 0);

//   //   const collisionA = entityA.components.get("Collision") as
//   //     | Components.CollisionComponent
//   //     | undefined;
//   //   const collisionB = entityB.components.get("Collision") as
//   //     | Components.CollisionComponent
//   //     | undefined;

//   //   if (!collisionA || !collisionB) return new Cluster.Vector(0, 0);

//   //   if (overlap.x < overlap.y) {
//   //     return transformA.position.x < transformB.position.x
//   //       ? new Cluster.Vector(-1, 0)
//   //       : new Cluster.Vector(1, 0);
//   //   } else if (overlap.x > overlap.y) {
//   //     return transformA.position.y < transformB.position.y
//   //       ? new Cluster.Vector(0, -1)
//   //       : new Cluster.Vector(0, 1);
//   //   } else if (overlap.x === overlap.y) {
//   //     // ... edge case
//   //   }
//   //   return new Cluster.Vector(0, 0);
//   // }

//   // private _slideResolution(entity: Cluster.Entity) {
//   //   const collision = entity.components.get("Collision") as
//   //     | Components.CollisionComponent
//   //     | undefined;

//   //   if (!collision) return;

//   //   const collisionData = collision.data.get("slide");
//   //   if (!collisionData || !collisionData.length) return;

//   //   const transform = entity.components.get("Transform") as
//   //     | Components.TransformComponent
//   //     | undefined;
//   //   const velocity = entity.components.get("Velocity") as
//   //     | Components.VelocityComponent
//   //     | undefined;

//   //   if (!transform || !velocity) return;

//   //   collisionData.sort((a, b) => b.area - a.area);

//   //   const first = collisionData[0];
//   //   const normal = first.normal;
//   //   const overlap = first.overlap;

//   //   transform.position.x += overlap.x * normal.x;
//   //   transform.position.y += overlap.y * normal.y;

//   //   if (normal.x !== 0) {
//   //     velocity.x = 0;
//   //   }
//   //   if (normal.y !== 0) {
//   //     velocity.y = 0;
//   //   }
//   // }

//   constructor() {
//     super(["Collision"]);
//   }

//   update(entities: Set<Cluster.Entity>) {
//     if (entities.size === 0) return;

//     this.emit("systemStarted");

//     for (let entity of entities) {
//       if (entity.dead || !entity.active) continue;

//       try {
//         const collision = entity.components.get("Collision") as
//           | Components.CollisionComponent
//           | undefined;

//         if (!collision || collision.data.size === 0) continue;

//         const { resolvers } = collision;
//         collision.data.forEach((collisionData, key) => {
//           switch (key) {
//             case "die":
//               entity.dead = true;
//               store.dispatch("addScore", 10);
//               // const dieResolver = resolvers.find(
//               //   (resolver) => resolver.type === key
//               // );
//               // dieResolver?.actions?.forEach((action) => {
//               //   store.dispatch(action.name, action.data);
//               // });
//               break;
//             case "sleep":
//               entity.active = false;
//               break;
//             case "none":
//               break;
//             default:
//               break;
//           }
//         });

//         if (entity.dead) {
//           this.emit("entityDestroyed", entity.id);
//         }

//         collision.data.clear();
//       } catch (error) {
//         this.emit("systemError", error);
//       }
//     }

//     this.emit("systemUpdated");
//   }
// }
