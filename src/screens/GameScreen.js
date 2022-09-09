import Container from "../cluster/core/Container";
import Vector from "../cluster/utils/Vector";
import Dummy from "../entities/Dummy";
import Timer from "../entities/Timer";

class GameScreen extends Container {
  constructor(game, controller) {
    super();
    const { width, height } = game;
    const dummies = new Container();
    const bounds = {
      x: 0,
      y: 0,
      w: width,
      h: height,
    };

    this.controller = controller;
    this.elapsed = 0;
    this.running = true;
    this.bounds = bounds;

    // this.dummies = this.add(dummies);
    this.dummy = this.add(new Dummy(bounds));
    this.timer = this.add(new Timer(new Vector(bounds.w / 2, 50)));

    this.initialize();
  }

  // initialize
  initialize() {
    // const { bounds } = this;
    // for (let i = 0; i < 1; i++) {
    //   this.dummies.children.push(new Dummy(bounds));
    // }
  }

  // test update
  update(dt, t) {
    const { timer, dummy } = this;
    this.elapsed += dt;
    if (this.elapsed >= 2) this.running = false;

    if (this.running) {
      super.update(dt, t);
      timer.text = `time: ${this.elapsed.toFixed(3)}, vel: ${dummy.velocity.x.toFixed(
        3
      )}, pos: ${dummy.position.x.toFixed(3)}`;
    }
  }
}

export default GameScreen;
