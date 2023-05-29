import Screen from "./Screen";

class GameOver extends Screen {
  constructor(game, input, state, transitions) {
    super(game, input, state, transitions);
  }

  update(dt, t) {
    console.log("game over", dt);
  }
}

export default GameOver;
