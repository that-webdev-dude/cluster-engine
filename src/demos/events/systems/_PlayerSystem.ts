import * as Cluster from "../../../cluster";
import * as Components from "../components";
import * as Events from "../events";
import { store } from "../store";

/** Player system
 * @required Transform, Player
 * @emits systemError
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

        const { speed } = playerComponent;

        const position =
          entity.get<Components.TransformComponent>("Transform")?.position;

        if (position) {
          position.x += Cluster.Keyboard.x() * speed * dt;
        }
      } catch (error) {
        // store.emit<Events.SystemErrorEvent>(
        //   {
        //     type: "system-error",
        //     data: {
        //       origin: "PlayerSystem",
        //       error,
        //     },
        //   },
        //   true
        // );
      }
    }
  }
}
