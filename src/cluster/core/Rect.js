import Vector from "../utils/Vector";

class Rect {
  // prettier-ignore
  constructor(
    { width = 32, 
      height = 32, 
      style = { fill: "#833" },
      position = new Vector()
    } = {
      width: 32,
      height: 32,
      style: { fill: "#833" },
      position : new Vector()
    }
  ) {
    this.position = position;
    this.height = height;
    this.width = width;
    this.style = style;
  }
}

export default Rect;
