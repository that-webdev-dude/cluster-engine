import * as Cluster from "../../../cluster";
import * as Components from "../components";
import * as Constants from "../constants";

export class RedBackgroundEntity extends Cluster.Entity {
  constructor() {
    super();

    const transformComponent = new Components.TransformComponent({
      position: new Cluster.Vector(0, 0),
    });

    const zindexComponent = new Components.ZindexComponent({
      zindex: 0,
    });

    const rectComponent = new Components.RectComponent({
      width: Constants.DISPLAY.width,
      height: Constants.DISPLAY.height,
      fill: "red",
      stroke: "transparent",
    });

    this.add(transformComponent);
    this.add(zindexComponent);
    this.add(rectComponent);
  }
}
