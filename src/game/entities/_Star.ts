import { store } from "../store";
import * as Cluster from "../../cluster";
import * as Components from "../components";

/** Star entity
 * @components Transform, Velocity, Alpha, Rect, Zindex
 */
export class Star extends Cluster.Entity {
  constructor() {
    super();
    const screenHeight = store.get("screenHeight");
    const screenWidth = store.get("screenWidth");
    const width = Cluster.Cmath.rand(1, 4);
    const height = width;

    const transform = new Components.TransformComponent({
      boundary: "wrap",
      position: new Cluster.Vector(
        Cluster.Cmath.rand(0, screenWidth),
        Cluster.Cmath.rand(0, screenHeight)
      ),
    });

    const velocity = new Components.VelocityComponent({
      velocity: new Cluster.Vector(-Cluster.Cmath.rand(50, 200), 0),
    });

    const rect = new Components.RectComponent({
      width,
      height,
      fill: "white",
      stroke: "transparent",
    });

    const alpha = new Components.AlphaComponent({
      alpha: Cluster.Cmath.randf(0.5, 1),
    });

    const zindex = new Components.ZindexComponent({
      zindex: 0,
    });

    this.components.set("Transform", transform);
    this.components.set("Velocity", velocity);
    this.components.set("Rect", rect);
    this.components.set("Alpha", alpha);
    this.components.set("Zindex", zindex);
  }
}
