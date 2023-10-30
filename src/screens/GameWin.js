import Screen from "./Screen";
import cluster from "../cluster";

class GameWin extends Screen {
  constructor(game, input, globals = {}, transitions = {}) {
    super(game, input, globals, transitions);
  }

  update(dt, t) {
    super.update(dt, t);
  }
}

export default GameWin;
