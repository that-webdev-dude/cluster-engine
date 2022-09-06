import Vector from "../utils/Vector";

class Rect {
  constructor(
    { width = 32, height = 32, style = { fill: "#833" } } = {
      width: 32,
      height: 32,
      style: { fill: "#833" },
    }
  ) {
    this.position = new Vector();
    this.height = height;
    this.width = width;
    this.style = style;
  }
}

export default Rect;
