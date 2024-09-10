import * as Cluster from "../../../cluster";
import * as Components from "../components";
import * as Events from "../events";
import { DISPLAY, COLLISION_LAYERS } from "../constants";

export class BrickEntity extends Cluster.Entity {
  constructor(position: Cluster.Vector) {
    super();

    const transformComponent = new Components.TransformComponent({
      position: position,
    });

    const zindexComponent = new Components.ZindexComponent({
      zindex: 1,
    });

    const rectComponent = new Components.RectComponent({
      width: 50,
      height: 20,
      fill: "lime",
      stroke: "transparent",
    });

    const collisionComponent = new Components.CollisionComponent({
      layer: COLLISION_LAYERS.brick,
      hitbox: {
        x: 0,
        y: 0,
        width: 50,
        height: 20,
      },
      resolvers: [
        {
          type: "die",
          mask: COLLISION_LAYERS.ball,
        },
      ],
    });

    this.add(transformComponent);
    this.add(zindexComponent);
    this.add(rectComponent);
    this.add(collisionComponent);
  }
}
