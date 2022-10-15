// import Ball from "../entities/Ball";
// import Wall from "../entities/Wall";
import cluster from "../cluster/index";
import math from "../cluster/utils/math";
const { Container, Vector, Line } = cluster;

const ACCELERATION = 1;

class GamePlayScreen extends Container {
  constructor(game, input, onRestart = () => {}) {
    super();

    const gameW = game.width;
    const gameH = game.height;

    this.input = input;

    this.vecA = new Vector(200, 200);
    this.vecB = new Vector(-200, -200);

    // DEBUG! ----------------------------------------------------------------------
    const start = new Vector(gameW / 2, gameH / 2);
    this.vecA.display(this, "blue", start);
    this.vecB.display(this, "red", start);
    // END DEBUG! ------------------------------------------------------------------
  }

  update(dt, t) {
    super.update(dt, t);
    const { input } = this;
    if (input.key.x !== 0 || input.key.y !== 0) {
      this.vecA.add({ x: input.key.x * 4, y: input.key.y * 4 });
    }
  }
}

export default GamePlayScreen;
