import { CollisionLayers } from "./constants/CollisionLayers";
import * as Cluster from "../../cluster";
import * as Components from "../components";

/** DebugRect
 * @components Transform, Rect, Zindex
 */
export class DebugRect extends Cluster.Entity {
  constructor(position: Cluster.Vector) {
    super();

    const transform = new Components.TransformComponent({
      position: position,
    });

    const velocity = new Components.VelocityComponent({
      velocity: new Cluster.Vector(0, 0),
    });

    const rect = new Components.RectComponent({
      width: 64,
      height: 64,
      fill: "transparent",
      stroke: "red",
    });

    const zindex = new Components.ZindexComponent({
      zindex: 1,
    });

    const collision = new Components.CollisionComponent({
      layer: CollisionLayers.Debug,
      hitbox: {
        x: 0,
        y: 0,
        width: 64,
        height: 64,
      },
      resolvers: [
        {
          type: "slide",
          mask: CollisionLayers.Spaceship,
        },
      ],
    });

    this.components.set("Transform", transform);
    this.components.set("Velocity", velocity);
    this.components.set("Rect", rect);
    this.components.set("Zindex", zindex);
    this.components.set("Collision", collision);
  }
}
