import cluster from "../cluster/index";
const { Container, VectorViewer, math, Vector } = cluster;

class GamePlay extends Container {
  constructor(game, input, transitions = { onEnter: () => {}, onExit: () => {} }) {
    super();
    this.game = game;
    this.input = input;
    this.onExit = transitions?.onExit || function () {};
    this.onEnter = transitions?.onEnter || function () {};
    this.updates = 0;

    this.vecViewer = this.add(new VectorViewer());
    this.vecA = new Vector(100, -200);
    this.vecB = new Vector(-200, 100);

    this.vecC = this.vecA.clone().add(this.vecB);
    // this.vecC = this.vecA.clone().subtract(this.vecB);
    // this.vecC = this.vecA.clone().normal().scale(this.vecA.magnitude);
    // this.vecC = this.vecA.clone().reverse();
    console.log(math.rad2deg(this.vecC.angleTo(this.vecA)));

    this.__vecA = this.vecViewer.display(
      this.vecA,
      new Vector(400, 300),
      (dt, t) => {
        // ...
      },
      "red"
    );

    this.__vecB = this.vecViewer.display(
      this.vecB,
      new Vector(400, 300),
      (dt, t) => {
        // ...
      },
      "blue"
    );

    this.__vecC = this.vecViewer.display(
      this.vecC,
      new Vector(400, 300),
      (dt, t) => {
        // ...
      },
      "green"
    );
  }

  update(dt, t) {
    super.update(dt, t);
  }
}

export default GamePlay;
