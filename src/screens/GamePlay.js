import Player from "../entities/Player";
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

    this.player = new Player(input);

    this.add(this.player);
  }

  update(dt, t) {
    super.update(dt, t);
    // if (this.input.mouse.isPressed) {
    //   this.onExit();
    // }

    // this.input.mouse.update();
  }
}

export default GamePlay;
