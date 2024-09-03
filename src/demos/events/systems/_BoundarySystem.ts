import * as Cluster from "../../../cluster";
import * as Components from "../components";
import * as Events from "../events";
import { store } from "../store";

/** Boundary system
 * @required Transform,
 * @emits systemStarted, systemUpdated, systemError
 */
export class BoundarySystem extends Cluster.System {
  private _screenHeight: number;
  private _screenWidth: number;

  constructor() {
    super(["Boundary", "Transform"]);

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

  private _bounce(
    position: Cluster.Vector,
    velocity: Cluster.Vector,
    width: number,
    height: number
  ) {
    let maxX = this._screenWidth - width;
    let maxY = this._screenHeight - height;
    if (position.x > maxX) {
      position.x = maxX;
      velocity.x *= -1;
    } else if (position.x < 0) {
      position.x = 0;
      velocity.x *= -1;
    }

    if (position.y > maxY) {
      position.y = maxY;
      velocity.y *= -1;
    } else if (position.y < 0) {
      position.y = 0;
      velocity.y *= -1;
    }
  }

  update(entities: Set<Cluster.Entity>) {
    if (entities.size === 0) return;

    // systemStarted
    for (let entity of entities) {
      if (entity.dead || !entity.active) continue;

      try {
        const transformComponent =
          entity.get<Components.TransformComponent>("Transform");
        const boundaryComponent =
          entity.get<Components.BoundaryComponent>("Boundary");

        if (!transformComponent || !boundaryComponent) continue;

        const sprite = entity.get<Components.SpriteComponent>("Sprite");
        const rect = entity.get<Components.RectComponent>("Rect");

        if (sprite && rect) {
          throw new Error(
            "[BoundarySystem Error] Entity cannot have both Sprite and Rect components"
          );
        }

        let width = 0;
        let height = 0;

        if (rect) {
          width = rect.width;
          height = rect.height;
        } else if (sprite) {
          width = sprite.width;
          height = sprite.height;
        }

        const { position } = transformComponent;
        const { behavior } = boundaryComponent;

        switch (behavior) {
          case "contain":
            this._contain(position, width, height);
            break;
          case "wrap":
            this._wrap(position, width, height);
            break;
          case "bounce":
            const velocityComponent =
              entity.get<Components.VelocityComponent>("Velocity");

            if (!velocityComponent) continue;

            const { velocity } = velocityComponent;
            this._bounce(position, velocity, width, height);
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
              entity.dead = true;

              store.emit({
                type: "entity-destroyed",
                data: { entity },
              });
            }
            break;
          default:
            break;
        }
      } catch (error) {
        store.emit(
          {
            type: "system-error",
            data: {
              origin: "BoundarySystem",
              error,
            },
          },
          true
        );
      }
    }

    // systemUpdated
  }
}
