import Container from "../cluster/core/Container";
import Vector from "../cluster/utils/Vector";
import Dummy from "../entities/Dummy";
import Timer from "../entities/Timer";

class GameScreen extends Container {
  constructor(game, controller) {
    super();
    const { width, height } = game;
    const velocity = width / 3;

    this.controller = controller;
    this.height = height;
    this.width = width;
    this.dummy = this.add(new Dummy(velocity));
    this.timer = this.add(new Timer(new Vector(width / 2, 50)));
    this.initialize();
  }

  // test init
  initialize() {
    const { dummy, height } = this;
    dummy.position.set(0, height - 48);
  }

  // test reset
  reset() {
    const { dummy, timer, height } = this;
    timer.reset();
    dummy.position.set(0, height - 48);
  }

  // test update
  update(dt, t) {
    super.update(dt, t);
    const { dummy, timer, width, height, controller } = this;

    if (dummy.position.x >= width) {
      timer.stop();
      dummy.position.set(width, height - 48);
    }

    if (controller.action) {
      this.reset();
    }
  }
}

export default GameScreen;
