import { Vector, Entity } from "../cluster";
import { Components } from "../cluster/ecs";
import { GAME_CONFIG } from "../config/GameConfig";

const {
  height: GAME_HEIGHT,
  width: GAME_WIDTH,
  fontStyle: GAME_FONT_STYLE,
} = GAME_CONFIG;

export class UiScore extends Entity {
  constructor() {
    super();

    const transform = new Components.Transform({
      position: new Vector(GAME_WIDTH / 2, GAME_HEIGHT - 32),
    });
    const colour = new Components.Colour({
      fill: "red",
    });
    const text = new Components.Text({
      string: "Score: 0",
      align: "center",
      font: `14px ${GAME_FONT_STYLE}`,
    });

    this.attachComponent(transform);
    this.attachComponent(colour);
    this.attachComponent(text);
  }
}
