import { store } from "../store";
import * as Cluster from "../../cluster";
import * as Components from "../components";

/** Background entity
 * @components Transform, Rect, Zindex
 */
export class Background extends Cluster.Entity {
  constructor() {
    super();

    const transform = new Components.TransformComponent({
      position: new Cluster.Vector(0, 0),
    });

    const rect = new Components.RectComponent({
      width: store.get("screenWidth"),
      height: store.get("screenHeight"),
      fill: "#191970",
    });

    const zindex = new Components.ZindexComponent({
      zindex: 0,
    });

    this.components.set("Transform", transform);
    this.components.set("Rect", rect);
    this.components.set("Zindex", zindex);
  }
}
