import cluster from "../cluster/index";
const { Container, Text, Vector } = cluster;

class GameOver extends Container {
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
  }
}

export default GameOver;
