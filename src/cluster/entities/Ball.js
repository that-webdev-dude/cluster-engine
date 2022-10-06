import cluster from "../index";

const { Container, Vector, Text } = cluster;

const ACCELERATION = 1;
const FRICTION = 0.05;

class Ball extends Container {
  constructor(
    {
      position = new Vector(),
      radius = 100,
      input = null,
      style = { fill: "black", stroke: "transparent" },
      mass = 1,
      elasticity = 1,
    } = {
      position: new Vector(),
      radius: 100,
      input: null,
      style: { fill: "black", stroke: "transparent" },
      mass: 1,
      elasticity: 1,
    }
  ) {
    super();
    this.acceleration = new Vector();
    this.velocity = new Vector();
    this.elasticity = elasticity;
    this.position = position;
    this.radius = radius;
    this.style = style;
    this.input = input;
    this.mass = mass;

    // DEBUG! ----------------------------------------------------------------------
    // this.velLog = this.add(
    //   new Text(``, {
    //     fill: "black",
    //     align: "center",
    //   })
    // );
    // this.velLog.anchor = { x: 0, y: -8 };

    // this.massLog = this.add(
    //   new Text(``, {
    //     fill: "black",
    //     align: "center",
    //   })
    // );
    // this.massLog.anchor = { x: 0, y: 4 };
    // END DEBUG! ------------------------------------------------------------------
  }

  updateDebug() {
    // this.velLog.text = `v: ${this.velocity.magnitude.toFixed(2)}`;
    // this.massLog.text = `m: ${this.mass.toFixed(2)}`;
  }

  get inverseMass() {
    const { mass } = this;
    return mass === 0 ? 0 : 1 / mass;
  }

  update(dt, t) {
    super.update(dt, t);

    if (this.input) {
      const { input } = this;
      if (input.key.x !== 0 || input.key.y !== 0) {
        this.acceleration.set(ACCELERATION * input.key.x, ACCELERATION * input.key.y);
      }
      if (input.key.x === 0) {
        this.acceleration.x = 0;
      }
      if (input.key.y === 0) {
        this.acceleration.y = 0;
      }
    }

    this.velocity.add(this.acceleration);
    this.velocity.scale(1 - FRICTION);
    this.position.add(this.velocity);
    if (this.velocity.magnitude < 0.1) {
      this.velocity.set(0, 0);
    }

    // debug
    this.updateDebug();
  }
}

export default Ball;
