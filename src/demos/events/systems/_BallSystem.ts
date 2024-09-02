import * as Cluster from "../../../cluster";
import * as Components from "../components";
import * as Events from "../events";
import { store } from "../store";

/** Ball system
 * @required Transform, Ball
 * @emits systemStarted, systemUpdated, systemError
 */
export class BallSystem extends Cluster.System {
  constructor() {
    super(["Ball"]);
  }

  update(entities: Set<Cluster.Entity>, dt: number) {
    if (entities.size === 0) return;

    for (let entity of entities) {
      if (entity.dead || !entity.active) continue;

      try {
        const ballComponent = entity.get<Components.BallComponent>("Ball");

        if (!ballComponent) continue;

        const { speed } = ballComponent;

        const position =
          entity.get<Components.TransformComponent>("Transform")?.position;
        const velocity =
          entity.get<Components.VelocityComponent>("Velocity")?.velocity;

        if (position && velocity) {
          position.x += velocity.x * dt * speed;
          position.y += velocity.y * dt * speed;
        }
      } catch (error) {
        store.emit<Events.SystemErrorEvent>(
          {
            type: "system-error",
            data: {
              origin: "BallSystem",
              error,
            },
          },
          true
        );
      }
    }
  }
}
