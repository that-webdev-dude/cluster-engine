import * as Images from "../../../images";
import * as Cluster from "../../../cluster";
import * as Components from "../components";
import * as Events from "../events";
import { store } from "../store";
import { COLLISION_LAYERS } from "../constants";

export class PlayerEntity extends Cluster.Entity {
  constructor() {
    super();

    const transformComponent = new Components.TransformComponent({
      position: new Cluster.Vector(100, 0),
      pivot: new Cluster.Vector(32, 32),
      angle: 90,
    });

    const velocityComponent = new Components.VelocityComponent({
      velocity: new Cluster.Vector(0, 0),
    });

    const boundaryComponent = new Components.BoundaryComponent({
      boundary: "die",
    });

    const spriteComponent = new Components.SpriteComponent({
      image: Images.playerImage,
      width: 64,
      height: 64,
    });

    const alphaComponent = new Components.AlphaComponent({
      alpha: 1,
    });

    const zindexComponent = new Components.ZindexComponent({
      zindex: 1,
    });

    const playerComponent = new Components.PlayerComponent({
      invincible: false,
    });

    const collisionComponent = new Components.CollisionComponent({
      layer: COLLISION_LAYERS.PLAYER,
      mask: COLLISION_LAYERS.ENEMY,
      hitbox: {
        x: 0,
        y: 0,
        width: 64,
        height: 64,
      },
      resolvers: [
        {
          type: "none",
          mask: COLLISION_LAYERS.ENEMY,
        },
      ],
    });

    this.components.set("Transform", transformComponent);
    this.components.set("Velocity", velocityComponent);
    this.components.set("Boundary", boundaryComponent);
    this.components.set("Sprite", spriteComponent);
    this.components.set("Alpha", alphaComponent);
    this.components.set("Zindex", zindexComponent);
    this.components.set("Player", playerComponent);
    this.components.set("Collision", collisionComponent);

    store.on<Events.EntityHitEvent>("entity-hit", (event) => {
      const { data } = event;
      if (data.entityA === this || data.entityB === this) {
        alphaComponent.alpha = 0.5;
      }
    });
  }
}
