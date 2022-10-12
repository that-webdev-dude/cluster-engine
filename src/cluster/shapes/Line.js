import Vector from "../utils/Vector";
import Polygon from "./Polygon";

class Line extends Polygon {
  constructor(
    { start = new Vector(), end = new Vector(), style = {} } = {
      start: new Vector(),
      end: new Vector(),
      style: {},
    }
  ) {
    super({ path: [start, end], style, position });
    this.start = start;
    this.end = end;
  }
}

export default Line;
