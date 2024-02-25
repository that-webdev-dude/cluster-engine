import { GAME_CONFIG } from "../config/GameConfig";
import { Vector, Physics, Cmath, Rect } from "../ares";

class Ground extends Rect {
  constructor() {
    super({
      position: new Vector(0, GAME_CONFIG.height - 50),
      size: new Vector(GAME_CONFIG.width, 10),
      style: {
        fill: "grey",
      },
      physics: { mass: 2 },
    });

    console.log(this);
  }
}

export default Ground;
