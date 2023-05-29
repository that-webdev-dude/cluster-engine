import Screen from "./Screen";
import cluster from "../cluster";
const {} = cluster;

class GamePlay extends Screen {
  constructor(game, input, state, transitions) {
    super(game, input, state, transitions);
  }

  update(dt, t) {
    super.update(dt, t);
    // console.log("game play", dt);
  }
}

export default GamePlay;
