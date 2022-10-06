import Vector from "../utils/Vector";
import Polygon from "./Polygon";

class Line extends Polygon {
  constructor(
    {
      start = new Vector(),
      end = new Vector(),
      style = { stroke: "black" },
      position = new Vector(),
    } = {
      start: new Vector(),
      end: new Vector(),
      style: { stroke: "black" },
      position: new Vector(),
    }
  ) {
    super({ path: [start, end], style, position });
    this.start = start;
    this.end = end;
  }
}

export default Line;
