import * as Cluster from "../../../cluster";
import * as Components from "../components";
import * as Events from "../events";
import { store } from "../store";

/** Player system
 * @required Transform, Player
 * @emits systemStarted, systemUpdated, systemError
 */
export class PlayerSystem extends Cluster.System {
  constructor() {
    super(["Player"]);
  }

  update(entities: Set<Cluster.Entity>, dt: number) {
    if (entities.size === 0) return;

    for (let entity of entities) {
      if (entity.dead || !entity.active) continue;

      try {
        const playerComponent =
          entity.get<Components.PlayerComponent>("Player");

        if (!playerComponent) continue;

        const position =
          entity.get<Components.TransformComponent>("Transform")?.position;

        if (position) {
          position.x += Cluster.Keyboard.x() * 100 * dt;
          position.y += Cluster.Keyboard.y() * 100 * dt;
        }

        // update visibility when player is invincible
        // const alphaComponent =
        //   entity.get<Components.AlphaComponent>("Alpha");
        // if (alphaComponent) {
        //   alphaComponent.alpha = playerComponent.invincible ? 0.5 : 1;
        // }
      } catch (error) {
        store.emit<Events.SystemErrorEvent>(
          {
            type: "system-error",
            data: {
              origin: "PlayerSystem",
              error,
            },
          },
          true
        );
      }
    }
  }
}
