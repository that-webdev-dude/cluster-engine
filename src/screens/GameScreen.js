import Container from "../cluster/core/Container";
import Vector from "../cluster/utils/Vector";
import Dummy from "../entities/Dummy";
import Timer from "../entities/Timer";

class GameScreen extends Container {
  constructor(game, controller) {
    super();
    const { width, height } = game;
    // const dummies = new Container();
    const timer = this.add(new Timer(new Vector(width / 2, 50)));
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
    this.height = height;
    this.width = width;

    // this.dummies = this.add(dummies);
    // for (let i = 0; i < 1; i++) {
    //   this.dummies.children.push(new Dummy(bounds));
    // }
    this.dummy = this.add(
      new Dummy(bounds, (text) => {
        timer.text = text;
      })
    );
  }

  // test update
  // update(dt, t) {
  //   super.update(dt, t);
  // }
}

export default GameScreen;
