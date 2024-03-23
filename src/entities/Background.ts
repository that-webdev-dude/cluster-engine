import { GAME_CONFIG } from "../config/GameConfig";
import { Rect } from "../cluster";

export class Background extends Rect {
  constructor() {
    super({
      width: GAME_CONFIG.width,
      height: GAME_CONFIG.height,
      style: {
        fill: "rgba(0, 0, 0, 0.90)",
        stroke: "transparent",
      },
    });
  }
}
