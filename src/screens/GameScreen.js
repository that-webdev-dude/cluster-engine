import Container from "../cluster/core/Container";
import Dummy from "../entities/Dummy";
import math from "../cluster/utils/math";
import Vector from "../cluster/utils/Vector";
import Text from "../cluster/core/Text";

class Logger extends Text {
  constructor(position = new Vector(0, 0), text = "") {
    super(text, {
      font: "16px 'Press Start 2p'",
      fill: "red",
      align: "center",
    });
    this.position = position;
    this.text = text;
  }

  log(text) {
    this.text = text;
  }
}

class GameScreen extends Container {
  constructor(game, input) {
    super();
    const dummy = new Dummy(game, input);
    const logger = new Logger(new Vector(game.width / 2, 10));

    this.dummy = dummy;
    this.logger = logger;

    this.add(dummy);
    this.add(logger);
  }

  // test update
  update(dt, t) {
    super.update(dt, t);
    const { dummy, logger } = this;
    logger.log(`dummy vel: ${dummy.velocity.x.toFixed(3)}`);
  }
}

export default GameScreen;
