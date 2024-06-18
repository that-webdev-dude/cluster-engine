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

export class UiScore extends Entity {
  constructor() {
    super();

    // components
    const transform = new Components.Transform({
      position: new Vector(GAME_WIDTH / 2, GAME_HEIGHT - 32),
    });
    const colour = new Components.Colour({
      fill: "red",
    });
    const text = new Components.Text({
      string: `Scores: ${store.get("scores")}`,
      align: "center",
      font: `14px ${GAME_FONT_STYLE}`,
    });

    // listeners
    store.on("scores-changed", (scores: number) => {
      text.string = `Scores: ${scores}`;
    });

    this.attachComponent(transform);
    this.attachComponent(colour);
    this.attachComponent(text);
  }
}
