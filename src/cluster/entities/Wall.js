import Vector from "../utils/Vector";

class Wall {
  constructor(x1, y1, x2, y2) {
    this.start = new Vector(x1, y1);
    this.end = new Vector(x2, y2);
    this.path = [this.start, this.end];
    this.style = { stroke: "red" };
  }
}

export default Wall;
