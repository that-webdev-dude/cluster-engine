import { spaceshipBulletPool } from "./Bullet";
import { CollisionLayers } from "../constants/CollisionLayers";
import { store } from "../../store";
import * as Cluster from "../../../cluster";
import * as Components from "../../components";
import * as Images from "../../../images";

/** Spaceship entity
 * @components Controller, Transform, Velocity, Sprite, Zindex, Player, Spawner, Collision
 */
export class Spaceship extends Cluster.Entity {
  constructor() {
    super();
    const controller = new Components.ControllerComponent({
      action: "Space",
    });

    const transform = new Components.TransformComponent({
      boundary: "contain",
      position: new Cluster.Vector(64, store.get("screenHeight") / 2 - 32),
      pivot: new Cluster.Vector(32, 32),
      angle: 90,
    });

    const velocity = new Components.VelocityComponent({
      velocity: new Cluster.Vector(0, 0),
    });

    const zindex = new Components.ZindexComponent({
      zindex: 1,
    });

    const sprite = new Components.SpriteComponent({
      image: Images.playerImage,
      frame: 0,
      width: 64,
      height: 64,
    });

    const player = new Components.PlayerComponent({
      lives: 3,
      speed: 400,
      health: 100,
    });

    const spawner = new Components.SpawnerComponent({
      strategy: "bullet",
      pool: spaceshipBulletPool,
      limit: 0,
      interval: 0.1,
    });

    const collision = new Components.CollisionComponent({
      layer: CollisionLayers.Spaceship,
      hitbox: {
        x: 0,
        y: 0,
        width: 64,
        height: 64,
      },
      resolvers: [
        {
          type: "die",
          mask: CollisionLayers.Enemy | CollisionLayers.EnemyBullet,
          actions: [
            {
              name: "damage",
              data: 10,
            },
          ],
        },
      ],
    });

    this.components.set("Controller", controller);
    this.components.set("Transform", transform);
    this.components.set("Velocity", velocity);
    this.components.set("Zindex", zindex);
    this.components.set("Sprite", sprite);
    this.components.set("Player", player);
    this.components.set("Spawner", spawner);
    this.components.set("Collision", collision);
  }
}
