import Bullet from "./Bullet";
import cluster from "../cluster";
const { Vector, Physics, Capsule, math } = cluster;

const WIDTH = 10;
const HEIGTH = 50;
const RADIUS = 10;

class Cannon extends Capsule {
  constructor(position = new Vector(), input) {
    super({
      width: WIDTH,
      height: HEIGTH,
      radius: RADIUS,
      style: { fill: "black" },
    });

    this.input = input;
    this.position = position;
    this.anchor = new Vector(-WIDTH / 2, -HEIGTH);
    this.pivot = new Vector(WIDTH / 2, HEIGTH);
    this.angle = 0;
    this.target = new Vector();
  }

  spawnBullet() {
    const { target, position, angle } = this;
    const force = Vector.from(target).unit().scale(800);
    const bullet = new Bullet(Vector.from(position), angle, force);
    return bullet;
  }

  update(dt, t) {
    const { mouse } = this.input;
    this.target = this.position.to(mouse.position);
    this.angle = -math.angle({ x: 1, y: 0 }, this.target);
  }
}

export default Cannon;
