import { GAME_CONFIG } from "../config/GameConfig";
import { Vector, Physics, Cmath } from "../ares";
import PhysicsRect from "./PhysicsRect";

class Ground extends PhysicsRect {
  constructor() {
    super({
      physicsType: 0, // kinematic
      position: new Vector(0, 500),
      height: 5,
      width: GAME_CONFIG.width,
      fill: "grey",
    });
  }
}

export default Ground;
