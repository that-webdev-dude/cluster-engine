import Vector from "../utils/Vector";

class Polygon {
  // prettier-ignore
  constructor(
    { path = [], 
      style = { fill: "black" }, 
      position = new Vector(),
    } = {
      path: [],
      style: { fill: "black" },
      position: new Vector(),
    }
  ) {
    this.path = path;
    this.style = style;
    this.position = position;
  }
}

export default Polygon;
