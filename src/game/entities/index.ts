import { store } from "../store";
import * as Cluster from "../../cluster";
import * as Components from "../components";
import * as Strategies from "../strategies";
import * as Systems from "../systems";
import * as Images from "../../images";

const CollisionLayers = {
  Player: 1 << 0,
  Enemy: 1 << 1,
  Bullet: 1 << 2,
} as const;

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
      zindex: -1,
    });

    this.components.set("Transform", transform);
    this.components.set("Rect", rect);
    this.components.set("Zindex", zindex);
  }
}

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
      pool: playerBulletPool,
      limit: 0,
      interval: 0.1,
    });

    const collision = new Components.CollisionComponent({
      layer: CollisionLayers.Player,
      hitbox: {
        x: 0,
        y: 0,
        width: 64,
        height: 64,
      },
      resolvers: [
        {
          type: "none",
          mask: CollisionLayers.Enemy,
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

/** Bullet entity
 * @options position, direction, damage, speed [, frame]
 * @components Transform, Velocity, Sprite, Zindex, Bullet
 */
interface BulletOptions {
  position: Cluster.Vector;
  direction: Cluster.Vector;
  damage: number;
  speed: number;
  frame?: number;
}
export class Bullet extends Cluster.Entity {
  constructor({
    position,
    direction,
    damage,
    speed,
    frame = 0,
  }: BulletOptions) {
    super();

    const transform = new Components.TransformComponent({
      boundary: "sleep",
      position: position,
    });

    const velocity = new Components.VelocityComponent({
      velocity: new Cluster.Vector(direction.x * speed, direction.y * speed),
    });

    const sprite = new Components.SpriteComponent({
      image: Images.bulletsImage,
      frame: frame,
      width: 12,
      height: 12,
    });

    const zindex = new Components.ZindexComponent({
      zindex: 1,
    });

    const bullet = new Components.BulletComponent({
      damage: damage,
      speed: speed,
      direction: direction,
    });

    this.components.set("Transform", transform);
    this.components.set("Velocity", velocity);
    this.components.set("Sprite", sprite);
    this.components.set("Zindex", zindex);
    this.components.set("Bullet", bullet);
  }
}

/** Enemy entity
 * @options position, velocity
 * @components Health, Transform, Velocity, Texture, Zindex, Spawner
 */
interface EnemyOptions {
  position: Cluster.Vector;
}
export class Enemy extends Cluster.Entity {
  constructor({ position }: EnemyOptions) {
    super();

    const transform = new Components.TransformComponent({
      boundary: "sleep",
      position: position,
    });

    const velocity = new Components.VelocityComponent({
      velocity: new Cluster.Vector(-100, 0),
    });

    const sprite = new Components.SpriteComponent({
      image: Images.enemiesImage,
      frame: 27,
      width: 64,
      height: 64,
    });

    const zindex = new Components.ZindexComponent({
      zindex: 0,
    });

    const enemy = new Components.EnemyComponent({
      health: 100,
      speed: 100,
      damage: 10,
    });

    const spawner = new Components.SpawnerComponent({
      strategy: "bullet",
      pool: enemyBulletPool,
      limit: 0,
      interval: 1,
    });

    const collision = new Components.CollisionComponent({
      layer: CollisionLayers.Enemy,
      hitbox: {
        x: 0,
        y: 0,
        width: 64,
        height: 64,
      },
      // mask: CollisionLayers.Player,
      resolvers: [
        {
          type: "die",
          mask: CollisionLayers.Player,
        },
      ],
    });

    this.components.set("Transform", transform);
    this.components.set("Velocity", velocity);
    this.components.set("Sprite", sprite);
    this.components.set("Zindex", zindex);
    this.components.set("Enemy", enemy);
    this.components.set("Spawner", spawner);
    this.components.set("Collision", collision);
  }
}

/** Mothership entity
 * @components EnhanceSpawner
 */
export class Mothership extends Cluster.Entity {
  constructor() {
    super();
    this.components.set(
      "Spawner",
      new Components.SpawnerComponent({
        strategy: "enemy",
        pool: enemyPool,
        limit: 0,
        interval: 1,
      })
    );
  }
}

/** Star entity
 * @components Transform, Velocity, Alpha, Rect, Zindex
 */
export class Star extends Cluster.Entity {
  constructor() {
    super();
    const screenHeight = store.get("screenHeight");
    const screenWidth = store.get("screenWidth");
    this.components.set(
      "Transform",
      new Components.TransformComponent({
        boundary: "wrap",
        position: new Cluster.Vector(
          Cluster.Cmath.rand(0, screenWidth),
          Cluster.Cmath.rand(0, screenHeight)
        ),
      })
    );
    this.components.set(
      "Velocity",
      new Components.VelocityComponent({
        velocity: new Cluster.Vector(-Cluster.Cmath.rand(50, 200), 0),
      })
    );
    let width = Cluster.Cmath.rand(1, 4);
    let height = width;
    this.components.set(
      "Rect",
      new Components.RectComponent({
        width,
        height,
        fill: "white",
        stroke: "transparent",
      })
    );
    this.components.set(
      "Alpha",
      new Components.AlphaComponent({
        alpha: Cluster.Cmath.randf(0.5, 1),
      })
    );
    this.components.set(
      "Zindex",
      new Components.ZindexComponent({
        zindex: 0,
      })
    );
  }
}

/** UIScore entity
 * @components Transform, Text, Zindex
 */
export class UIScore extends Cluster.Entity {
  constructor() {
    super();
    this.components.set(
      "Transform",
      new Components.TransformComponent({
        position: new Cluster.Vector(0, 0),
      })
    );
    this.components.set(
      "Text",
      new Components.TextComponent({
        text: "Score: 0",
        font: "16px Arial",
        fill: "white",
      })
    );
    this.components.set(
      "Zindex",
      new Components.ZindexComponent({
        zindex: 2,
      })
    );
  }
}

/** UILives entity
 * @components Transform, Text, Zindex
 */
export class UILives extends Cluster.Entity {
  constructor() {
    super();
    this.components.set(
      "Transform",
      new Components.TransformComponent({
        position: new Cluster.Vector(0, 20),
      })
    );
    this.components.set(
      "Text",
      new Components.TextComponent({
        text: "Lives: 3",
        font: "16px Arial",
        fill: "white",
      })
    );
    this.components.set(
      "Zindex",
      new Components.ZindexComponent({
        zindex: 2,
      })
    );
  }
}

/** UIHealth entity
 * @components Transform, Text, Zindex
 */
export class UIHealth extends Cluster.Entity {
  constructor() {
    super();
    this.components.set(
      "Transform",
      new Components.TransformComponent({
        position: new Cluster.Vector(0, 40),
      })
    );
    this.components.set(
      "Text",
      new Components.TextComponent({
        text: "Health: 100",
        font: "16px Arial",
        fill: "white",
      })
    );
    this.components.set(
      "Zindex",
      new Components.ZindexComponent({
        zindex: 2,
      })
    );
  }
}

// pools
export const playerBulletPool = new Cluster.Pool<Bullet>(() => {
  return new Bullet({
    position: new Cluster.Vector(0, 0),
    direction: new Cluster.Vector(1, 0),
    damage: 10,
    speed: 500,
    frame: 0,
  });
}, 0);

export const enemyBulletPool = new Cluster.Pool<Bullet>(() => {
  return new Bullet({
    position: new Cluster.Vector(0, 0),
    direction: new Cluster.Vector(-1, 0),
    damage: 10,
    speed: 500,
    frame: 10,
  });
}, 0);

export const enemyPool = new Cluster.Pool<Enemy>(() => {
  return new Enemy({
    position: new Cluster.Vector(0, 0),
  });
}, 0);
