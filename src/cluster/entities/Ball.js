import Container from "../core/Container";
import Vector from "../utils/Vector";
import Text from "../core/Text";

const ACCELERATION = 1;
const FRICTION = 0.1;

class Ball extends Container {
  constructor(
    {
      position = new Vector(),
      radius = 100,
      input = null,
      style = { fill: "black", stroke: "transparent" },
    } = {
      position: new Vector(),
      radius: 100,
      input: null,
      style: { fill: "black", stroke: "transparent" },
    }
  ) {
    super();
    this.acceleration = new Vector();
    this.velocity = new Vector();
    this.position = position;
    this.radius = radius;
    this.style = style;
    this.input = input;

    // debug
    // this.velLog = this.add(
    //   new Text(``, {
    //     fill: "white",
    //     align: "center",
    //     font: "8px 'Press Start 2p'",
    //   })
    // );
    // this.velLog.anchor = { x: 0, y: -4 };
  }

  // updateDebug() {
  //   this.velLog.text = `V: ${this.velocity.magnitude.toFixed(2)}`;
  // }

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

      this.velocity.add(this.acceleration);
      this.velocity.scale(1 - FRICTION);
      if (this.velocity.magnitude < 0.1) this.velocity.set(0, 0);

      this.position.add(this.velocity);

      // debug
      // this.updateDebug();
    }
  }
}

export default Ball;
