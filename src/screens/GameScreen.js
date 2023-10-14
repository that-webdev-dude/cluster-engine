import Screen from "./Screen";
import cluster from "../cluster";

class GameScreen extends Screen {
  constructor(game, input) {
    super(game, input);
    // game state here ...

    this.firstUpdate = true;
  }

  update(dt, t) {
    super.update(dt, t);
    // game logic here ...

    if (this.firstUpdate) {
      // ...
      this.firstUpdate = false;
    }
  }
}

export default GameScreen;
