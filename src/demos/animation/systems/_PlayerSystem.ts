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
          spriteComponent.currentAnimationName = "walk";
        } else {
          spriteComponent.currentAnimationName = "idle";
        }

        let relativeMousePositionX =
          Cluster.Mouse.position.x > transformComponent.position.x ? 1 : -1;
        transformComponent.scale.x = relativeMousePositionX;
        transformComponent.anchor.x = -relativeMousePositionX * 16;
      } catch (error) {
        // do something with the error
      }
    }
  }
}
