import * as Images from "../../../images";
import * as Cluster from "../../../cluster";
import * as Components from "../components";
import { COLLISION_LAYERS } from "../constants";

export class EnemyEntity extends Cluster.Entity {
  constructor() {
    super();

    const transformComponent = new Components.TransformComponent({
      position: new Cluster.Vector(0, 0),
    });

    const velocityComponent = new Components.VelocityComponent({
      velocity: new Cluster.Vector(0, 0),
    });

    const spriteComponent = new Components.SpriteComponent({
      image: Images.enemiesImage,
      frame: 27,
      width: 64,
      height: 64,
    });

    const zindexComponent = new Components.ZindexComponent({
      zindex: 1,
    });

    const collisionComponent = new Components.CollisionComponent({
      layer: COLLISION_LAYERS.ENEMY,
      mask: COLLISION_LAYERS.PLAYER,
      hitbox: {
        x: 0,
        y: 0,
        width: 64,
        height: 64,
      },
      resolvers: [
        {
          type: "none",
          mask: COLLISION_LAYERS.PLAYER,
        },
      ],
    });

    this.components.set("Transform", transformComponent);
    this.components.set("Velocity", velocityComponent);
    this.components.set("Sprite", spriteComponent);
    this.components.set("Zindex", zindexComponent);
    this.components.set("Collision", collisionComponent);
  }
}
