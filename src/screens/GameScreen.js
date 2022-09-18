import Container from "../cluster/core/Container";

class GameScreen extends Container {
  constructor(game, input, onRestart = () => {}) {
    super();

    this.game = game;
    this.input = input;
    this.restart = onRestart;
    this.timer = 4;
  }

  update(dt, t) {
    super.update(dt, t);
  }
}

export default GameScreen;
