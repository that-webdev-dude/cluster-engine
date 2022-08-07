class Rect {
  constructor(
    { width = 32, height = 32, style = { fill: "#833" } } = {
      width: 32,
      height: 32,
      style: { fill: "#833" },
    }
  ) {
    this.position = { x: 0, y: 0 };
    this.height = height;
    this.width = width;
    this.style = style;
  }
}

export default Rect;
