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
      boundary: "wrap",
    });

    const speed = Cluster.Cmath.rand(-400, 400);
    const vx = Cluster.Cmath.randOneFrom([0, speed]);
    const vy = vx === 0 ? Cluster.Cmath.rand(-400, 400) : 0;
    const velocity = new Components.VelocityComponent({
      velocity: new Cluster.Vector(vx, vy),
    });

    const width = Cluster.Cmath.rand(16, 128);
    const height = Cluster.Cmath.rand(4, 16);
    const rect = new Components.RectComponent({
      width: width,
      height: height,
      fill: "transparent",
      stroke: "cyan",
    });

    const zindex = new Components.ZindexComponent({
      zindex: 1,
    });

    const collision = new Components.CollisionComponent({
      layer: CollisionLayers.Debug,
      hitbox: {
        x: 0,
        y: 0,
        width: width,
        height: height,
      },
      // resolvers: [
      //   {
      //     type: "slide",
      //     mask: CollisionLayers.Spaceship,
      //   },
      // ],
    });

    this.components.set("Transform", transform);
    this.components.set("Velocity", velocity);
    this.components.set("Rect", rect);
    this.components.set("Zindex", zindex);
    this.components.set("Collision", collision);
  }
}
