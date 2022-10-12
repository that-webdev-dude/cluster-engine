class Polygon {
  constructor(
    { path = [], style = {} } = {
      path: [],
      style: {},
    }
  ) {
    this.path = path;
    this.style = style;
  }
}

export default Polygon;
