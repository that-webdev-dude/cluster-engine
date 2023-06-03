import Screen from "./Screen";

class GameOver extends Screen {
  constructor(game, input, globals, transitions) {
    super(game, input, globals, transitions);
  }

  update(dt, t) {
    console.log("game over", dt);
  }
}

export default GameOver;
