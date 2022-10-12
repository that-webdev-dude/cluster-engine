import Capsule from "./Capsule";

class Circle extends Capsule {
  constructor(
    { radius = 32, style = {} } = {
      radius: 32,
      style: {},
    }
  ) {
    super({
      width: radius * 2,
      height: radius * 2,
      radius,
      style,
    });
  }
}

export default Circle;
