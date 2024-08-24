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
      context.textAlign = text.align;
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
      if (entity.dead || !entity.active) continue;

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

import { CollisionSystem } from "./_CollisionSystem";

export { CollisionSystem };
