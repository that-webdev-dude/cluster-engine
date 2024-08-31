import * as Cluster from "../../../cluster";
import * as Components from "../components";

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

    // Cluster.System.emit("systemStarted");

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

        // Cluster.System.emit("systemUpdated");
      } catch (error) {
        // Cluster.System.emit("systemError", error);
      }
    }
  }
}
