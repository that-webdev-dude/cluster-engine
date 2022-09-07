import Container from "../cluster/core/Container";
import Vector from "../cluster/utils/Vector";
import Dummy from "../entities/Dummy";
import Timer from "../entities/Timer";

// class Timer extends Text {
//   constructor(positionVec = new Vector(0, 0)) {
//     super("aaa", {
//       font: "20px 'Press Start 2p'",
//       fill: "red",
//       align: "center",
//     });

//     this.time = 0;
//     this.running = true;
//     this.position.copy(positionVec);
//   }

//   stop() {
//     this.running = false;
//   }

//   reset() {
//     this.time = 0;
//     this.running = true;
//   }

//   update(dt, t) {
//     if (this.running) {
//       this.time += dt;
//       this.text = `${this.time.toFixed(3)}`;
//     }
//   }
// }

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

  // init
  initialize() {
    const { dummy, height } = this;
    dummy.position.set(0, height - 48);
  }

  reset() {
    const { dummy, timer, height } = this;
    timer.reset();
    dummy.position.set(0, height - 48);
  }

  // update
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
