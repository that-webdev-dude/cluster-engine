import Container from "../core/Container";

class Capsule {
  constructor(
    { width = 64, height = 32, radius = 32, style = {} } = {
      width: 64,
      height: 32,
      radius: 32,
      style: {},
    }
  ) {
    this.width = width;
    this.height = height;
    this.radius = radius;
    this.style = style;
  }
}

export default Capsule;
