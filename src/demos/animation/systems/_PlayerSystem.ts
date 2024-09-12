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
    super(["Player", "Transform", "Sprite"]);
  }

  update(entities: Set<Cluster.Entity>, dt: number) {
    if (entities.size === 0) return;

    for (let entity of entities) {
      if (entity.dead || !entity.active) continue;

      try {
        const playerComponent =
          entity.get<Components.PlayerComponent>("Player")!;

        const transformComponent =
          entity.get<Components.TransformComponent>("Transform")!;

        const spriteComponent =
          entity.get<Components.SpriteComponent>("Sprite")!;

        if (Cluster.Keyboard.x() !== 0) {
          const { speed } = playerComponent;
          transformComponent.position.x += Cluster.Keyboard.x() * speed * dt;
          transformComponent.anchor.x = -Cluster.Keyboard.x() * 16;
          transformComponent.scale.x = Cluster.Keyboard.x();
          spriteComponent.currentAnimationName = "walk";
        } else {
          spriteComponent.currentAnimationName = "idle";
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
