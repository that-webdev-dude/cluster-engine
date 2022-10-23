import cluster from "../cluster";
const { Circle, Vector, Physics } = cluster;

const RADIUS = 3;
const GRAVITY = 500;
const FRICTION = 100;

class Bullet extends Circle {
  constructor(position = new Vector(), angle = 0, force) {
    super({
      radius: RADIUS,
      style: { fill: "red" },
    });

    this.acceleration = new Vector();
    this.velocity = new Vector();
    this.position = position;
    this.anchor = new Vector(-RADIUS, -RADIUS);
    this.pivot = this.anchor.clone().reverse();
    this.dead = false;
    this.mass = 1.25;
    this.first = true;
    this.force = force;
  }

  update(dt, t) {
    if (this.first) {
      Physics.applyImpulse(this, this.force, dt);
      this.first = false;
    }

    if (!this.dead) {
      Physics.applyForce(this, { x: 0, y: GRAVITY });
      Physics.applyForce(this, this.velocity.clone().unit().reverse().scale(FRICTION));
      this.position.add(Physics.reposition(this, dt));
    }
  }
}

export default Bullet;
