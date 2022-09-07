import Container from "../cluster/core/Container";
import Vector from "../cluster/utils/Vector";
import Dummy from "../entities/Dummy";

class GameScreen extends Container {
  constructor(game, controller) {
    super();
    const { width, height } = game;
    const velocity = width / 3;

    this.controller = controller;
    this.height = height;
    this.width = width;
    this.dummy = this.add(new Dummy(velocity));
    this.initialize();
  }

  // init
  initialize() {
    const { dummy, height } = this;
    this.dummy.position.set(0, height - 48);
  }

  // update
  update(dt, t) {
    super.update(dt, t);
  }
}

export default GameScreen;
