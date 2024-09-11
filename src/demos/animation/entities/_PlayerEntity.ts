import * as Cluster from "../../../cluster";
import * as Components from "../components";
import * as Events from "../events";
import { DISPLAY, COLLISION_LAYERS } from "../constants";

export class PlayerEntity extends Cluster.Entity {
  constructor() {
    super();

    const transformComponent = new Components.TransformComponent({
      position: new Cluster.Vector(DISPLAY.width / 2 - 50, DISPLAY.height - 50),
    });

    const boundaryComponent = new Components.BoundaryComponent({
      behavior: "contain",
    });

    const playerComponent = new Components.PlayerComponent({
      speed: 500,
    });

    const zindexComponent = new Components.ZindexComponent({
      zindex: 1,
    });

    const rectComponent = new Components.RectComponent({
      width: 100,
      height: 20,
      radius: 4,
      fill: "cyan",
      stroke: "transparent",
    });

    const collisionComponent = new Components.CollisionComponent({
      layer: COLLISION_LAYERS.player,
      hitbox: {
        x: 0,
        y: 0,
        width: 100,
        height: 20,
      },
    });

    this.add(transformComponent);
    this.add(boundaryComponent);
    this.add(playerComponent);
    this.add(zindexComponent);
    this.add(rectComponent);
    this.add(collisionComponent);
  }
}
