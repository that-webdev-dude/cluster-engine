import * as Cluster from "../../../cluster";
import * as Components from "../components";
import * as Events from "../events";
import { DISPLAY, COLLISION_LAYERS } from "../constants";

export class BallEntity extends Cluster.Entity {
  constructor() {
    super();

    const ballComponent = new Components.BallComponent({
      speed: 400,
    });

    const transformComponent = new Components.TransformComponent({
      position: new Cluster.Vector(
        DISPLAY.width / 2 - 5,
        DISPLAY.height / 2 - 5
      ),
    });

    const velocityComponent = new Components.VelocityComponent({
      velocity: new Cluster.Vector(0, 1),
    });

    const boundaryComponent = new Components.BoundaryComponent({
      behavior: "bounce",
    });

    const zindexComponent = new Components.ZindexComponent({
      zindex: 1,
    });

    const rectComponent = new Components.RectComponent({
      width: 10,
      height: 10,
      radius: 5,
      fill: "rgb(255, 0, 255)",
      stroke: "transparent",
    });

    const collisionComponent = new Components.CollisionComponent({
      layer: COLLISION_LAYERS.ball,
      mask: COLLISION_LAYERS.brick | COLLISION_LAYERS.player,
      hitbox: {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
      },
      resolvers: [
        {
          type: "bounce",
          mask: COLLISION_LAYERS.brick,
        },
        {
          type: "bounce",
          mask: COLLISION_LAYERS.player,
        },
      ],
    });

    this.add(ballComponent);
    this.add(transformComponent);
    this.add(velocityComponent);
    this.add(boundaryComponent);
    this.add(zindexComponent);
    this.add(rectComponent);
    this.add(collisionComponent);
  }
}
