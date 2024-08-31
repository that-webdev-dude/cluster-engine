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
        const spriteComponent =
          entity.get<Components.SpriteComponent>("Sprite");

        if (!transformComponent || !boundaryComponent || !spriteComponent)
          continue;

        const { width, height } = spriteComponent;
        const { position } = transformComponent;
        const { boundary } = boundaryComponent;

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
              entity.dead = true;

              store.dispatch("increment");
              store.emit<Events.EntityDestroyedEvent>({
                type: "entity-destroyed",
                data: { entity },
              });
            }
            break;
          default:
            break;
        }
      } catch (error) {
        store.emit<Events.SystemError>(
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
