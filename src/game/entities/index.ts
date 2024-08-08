import { store } from "../store";
import * as Cluster from "../../cluster";
import * as Components from "../components";
import * as Images from "../../images";

/** Spaceship entity
 * @components Health, Transform, Velocity, Texture, Zindex, Player
 */
export class Spaceship extends Cluster.Entity {
  constructor() {
    super();
    this.components.set(
      "Health",
      new Components.HealthComponent({
        health: 100,
      })
    );
    this.components.set(
      "Transform",
      new Components.TransformComponent({
        position: new Cluster.Vector(
          store.get("screenWidth") / 2 - 32,
          store.get("screenHeight") - 128
        ),
        scale: new Cluster.Vector(0.5, 0.5),
      })
    );
    this.components.set(
      "Velocity",
      new Components.VelocityComponent({
        velocity: new Cluster.Vector(0, 0),
      })
    );
    this.components.set(
      "Texture",
      new Components.TextureComponent({
        image: Images.playerImage,
      })
    );
    this.components.set(
      "Zindex",
      new Components.ZindexComponent({
        zindex: 0,
      })
    );
    this.components.set(
      "Player",
      new Components.PlayerComponent({
        lives: 3,
      })
    );
  }
}

/** Bullet entity
 * @options position, velocity
 * @components Transform, Velocity, Texture, Zindex
 */
interface BulletOptions {
  position: Cluster.Vector;
  velocity: Cluster.Vector;
}
export class Bullet extends Cluster.Entity {
  constructor({ position, velocity }: BulletOptions) {
    super();
    this.components.set(
      "Transform",
      new Components.TransformComponent({
        position: position,
      })
    );
    this.components.set(
      "Velocity",
      new Components.VelocityComponent({
        velocity: velocity,
      })
    );
    this.components.set(
      "Sprite",
      new Components.SpriteComponent({
        image: Images.bulletsImage,
        frame: 0,
        width: 8,
        height: 8,
      })
    );
    this.components.set(
      "Zindex",
      new Components.ZindexComponent({
        zindex: 1,
      })
    );
  }
}

/** Enemy entity
 * @options position, velocity
 * @components Health, Transform, Velocity, Texture, Zindex
 */
interface EnemyOptions {
  position: Cluster.Vector;
  velocity: Cluster.Vector;
}
export class Enemy extends Cluster.Entity {
  constructor({ position, velocity }: EnemyOptions) {
    super();
    this.components.set(
      "Health",
      new Components.HealthComponent({
        health: 100,
      })
    );
    this.components.set(
      "Transform",
      new Components.TransformComponent({
        position: position,
        scale: new Cluster.Vector(0.5, 0.5),
        pivot: new Cluster.Vector(32, 32),
        angle: -90,
      })
    );
    this.components.set(
      "Velocity",
      new Components.VelocityComponent({
        velocity: velocity,
      })
    );
    this.components.set(
      "Sprite",
      new Components.SpriteComponent({
        image: Images.enemiesImage,
        frame: 27,
        width: 64,
        height: 64,
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

/** Background entity
 * @components Transform, Rect, Zindex
 */
export class Background extends Cluster.Entity {
  constructor() {
    super();
    this.components.set(
      "Transform",
      new Components.TransformComponent({
        position: new Cluster.Vector(0, 0),
      })
    );
    this.components.set(
      "Rect",
      new Components.RectComponent({
        width: store.get("screenWidth"),
        height: store.get("screenHeight"),
        fill: "#000033",
      })
    );
    this.components.set(
      "Zindex",
      new Components.ZindexComponent({
        zindex: -1,
      })
    );
  }
}

/** Star entity
 * @options position, velocity
 * @components Transform, Velocity, Rect, Zindex
 */
interface StarOptions {
  position: Cluster.Vector;
  velocity: Cluster.Vector;
}
export class Star extends Cluster.Entity {
  constructor({ position, velocity }: StarOptions) {
    super();
    this.components.set(
      "Transform",
      new Components.TransformComponent({
        position: position,
      })
    );
    this.components.set(
      "Velocity",
      new Components.VelocityComponent({
        velocity: velocity,
      })
    );
    this.components.set(
      "Rect",
      new Components.RectComponent({
        width: 2,
        height: 2,
        fill: "white",
      })
    );
    this.components.set(
      "Zindex",
      new Components.ZindexComponent({
        zindex: -1,
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
