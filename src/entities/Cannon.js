import cluster from "../cluster";
const { Vector, Capsule } = cluster;

const WIDTH = 10;
const HEIGTH = 50;
const RADIUS = 10;

class Cannon extends Capsule {
  constructor(position = new Vector()) {
    super({
      width: WIDTH,
      height: HEIGTH,
      radius: RADIUS,
      style: { fill: "black" },
    });

    this.position = position;
    this.anchor = new Vector(-WIDTH / 2, -HEIGTH);
    this.pivot = new Vector(WIDTH / 2, HEIGTH);
    this.angle = 0;
  }
}

export default Cannon;
