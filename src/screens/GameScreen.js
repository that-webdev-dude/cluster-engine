import Container from "../cluster/core/Container";
import Dummy from "../entities/Dummy";
import math from "../cluster/utils/math";

class GameScreen extends Container {
  constructor(game, input) {
    super();

    this.balls = this.add(new Container());
    for (let i = 0; i < 30; i++) {
      let ball = new Dummy(game, input);
      // prettier-ignore
      ball.position.set(
        math.rand(48, game.width - 96), 
        math.rand(48, game.height - 96)
      );
      this.balls.children.push(ball);
    }
  }

  // test update
  update(dt, t) {
    super.update(dt, t);
    // collision detection and resolution
  }
}

export default GameScreen;
