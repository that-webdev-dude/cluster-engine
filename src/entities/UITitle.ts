import { GAME_CONFIG } from "../config/GameConfig";
import { Vector } from "../cluster";
import { Entity } from "../cluster";
import { Components } from "../cluster/ecs";
import { store } from "../store/store";

const {
  height: GAME_HEIGHT,
  width: GAME_WIDTH,
  fontStyle: GAME_FONT_STYLE,
} = GAME_CONFIG;

export class UITitle extends Entity {
  constructor() {
    super();

    // components
    const transform = new Components.Transform({
      position: new Vector(GAME_WIDTH / 2, GAME_HEIGHT / 2),
    });
    const colour = new Components.Colour({
      fill: "red",
    });
    const text = new Components.Text({
      string: store.get("title"),
      align: "center",
      font: `20px ${GAME_FONT_STYLE}`,
    });

    this.attachComponent(transform);
    this.attachComponent(colour);
    this.attachComponent(text);
  }
}
