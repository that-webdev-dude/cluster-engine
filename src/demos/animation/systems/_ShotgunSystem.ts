import * as Cluster from "../../../cluster";
import * as Components from "../components";
import * as Events from "../events";
import { store } from "../store";

/** Player system
 * @required Transform, Player
 * @emits systemError
 */
export class ShotgunSystem extends Cluster.System {
  constructor() {
    super(["Shotgun", "Transform", "Sprite", "Tracker"]);
  }

  update(entities: Set<Cluster.Entity>, dt: number) {
    if (entities.size === 0) return;

    for (let entity of entities) {
      if (entity.dead || !entity.active) continue;

      try {
        const shotgunComponent =
          entity.get<Components.ShotgunComponent>("Shotgun")!;
        const transformComponent =
          entity.get<Components.TransformComponent>("Transform")!;
        const trackerComponent =
          entity.get<Components.TrackerComponent>("Tracker")!;
        const spriteComponent =
          entity.get<Components.SpriteComponent>("Sprite")!;

        // update position
        transformComponent.position =
          trackerComponent.subject.get<Components.TransformComponent>(
            "Transform"
          )!.position;

        const relativeMousePositionX =
          Cluster.Mouse.position.x > transformComponent.position.x ? 1 : -1;

        transformComponent.anchor.x =
          -relativeMousePositionX * Math.abs(transformComponent.anchor.x);

        transformComponent.scale.x = relativeMousePositionX;

        // update rotation based on Cluster.Mouse.position
        let angle = Math.atan2(
          Cluster.Mouse.position.y - transformComponent.position.y,
          Cluster.Mouse.position.x - transformComponent.position.x
        );

        if (Cluster.Mouse.position.x < transformComponent.position.x) {
          angle += Math.PI;
        }

        transformComponent.angle =
          Cluster.Cmath.rad2deg(angle) * relativeMousePositionX;
      } catch (error) {
        // do something with the error
      }
    }
  }
}
