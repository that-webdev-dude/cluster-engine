import Level from "../levels/Level";
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

    // level
    this.level = this.add(new Level(game.width * 3, game.height));
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
