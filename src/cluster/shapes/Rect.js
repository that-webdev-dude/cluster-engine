import Capsule from "./Capsule";

class Rect extends Capsule {
  constructor(
    { width = 64, height = 32, style = {} } = {
      width: 64,
      height: 32,
      style: {},
    }
  ) {
    super({ width, height, radius: 0, style });
  }
}

export default Rect;
