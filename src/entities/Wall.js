import cluster from "../cluster/index";
const { Vector, math } = cluster;

class Wall {
  constructor(x1 = 0, y1 = 0, x2 = 0, y2 = 0, input = null) {
    this.input = input;
    this.start = new Vector(x1, y1);
    this.end = new Vector(x2, y2);
    this.path = [this.start, this.end];
    this.style = { stroke: "red" };

    this.friction = 0.96;
    this.omega = 0; // angular velocity
    this.angle = math.deg2rad(0);
    this.pivot = this.start.clone().add(this.end).scale(0.5);
  }

  update(dt, t) {
    const { input = null } = this;
    if (input) {
      const { key } = input;
      if (key.x !== 0) {
        if (this.omega < 1) this.omega += 0.25 * key.x * dt;
      }

      this.angle += this.omega;
      this.omega *= 0.96;
      if (this.angle >= Math.PI * 2) this.angle = 0;
    }
  }
}

export default Wall;
