import { GAME_CONFIG } from "../config/GameConfig";
import { Vector, Entity, Cmath } from "../cluster";
import { Components } from "../cluster/ecs";

const { width: GAME_WIDTH, height: GAME_HEIGHT } = GAME_CONFIG;

export class Bullet extends Entity {
  constructor() {
    super();

    const transform = new Components.Transform({
      position: new Vector(0, 0),
    });
    const size = new Components.Radius({
      radius: 4,
    });
    const screen = new Components.Screen({
      offscreenBehavior: "die",
      entityHeight: size.radius * 2,
      entityWidth: size.radius * 2,
      height: GAME_HEIGHT,
      width: GAME_WIDTH,
    });
    const speed = new Components.Speed({
      speed: new Vector(800, 0),
    });
    const status = new Components.Status({
      dead: false,
    });
    const colour = new Components.Colour({
      fill: "red",
      stroke: "transparent",
    });

    this.attachComponent(transform);
    this.attachComponent(size);
    this.attachComponent(speed);
    this.attachComponent(screen);
    this.attachComponent(status);
    this.attachComponent(colour);
  }
}
