import Container from "../cluster/core/Container";
import Vector from "../cluster/utils/Vector";
import CrashTestDummy from "../entities/CrashTestDummy";

class GameScreen extends Container {
  constructor(game, controller) {
    super();
    const { width, height } = game;
    const velocity = width / 3;

    this.controller = controller;
    this.height = height;
    this.width = width;
    this.ctd = this.add(new CrashTestDummy(velocity));
    this.initialize();
  }

  // init
  initialize() {
    const { ctd, height } = this;
    this.ctd.position.set(0, height - 48);
  }

  // update
  update(dt, t) {
    super.update(dt, t);
  }
}

export default GameScreen;
