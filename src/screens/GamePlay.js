import cluster from "../cluster/index";
const { Container } = cluster;

class GamePlay extends Container {
  constructor(game, input, transitions = { onEnter: () => {}, onExit: () => {} }) {
    super();
    this.game = game;
    this.input = input;
    this.onExit = transitions?.onExit || function () {};
    this.onEnter = transitions?.onEnter || function () {};
    this.updates = 0;
  }

  update(dt, t) {
    super.update(dt, t);
    console.log("... game play");

    if (this.input.mouse.isPressed) {
      this.onExit();
    }

    this.input.mouse.update();
  }
}

export default GamePlay;
