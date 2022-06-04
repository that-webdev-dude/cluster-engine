/**
 * Game Buffer:
 * Generic offscreen/onscreen canvas.
 * Width and Height are required parameters;
 * if the id parameter is padssed in, the canvas
 * will be taken from the DOM and will be onscreen
 */
class Buffer {
  #buffer;
  #color;

  constructor(
    { canvas = null, width = 0, height = 0, color = "transparent" } = {
      canvas: null,
      width: 0,
      height: 0,
      color: "transparent",
    }
  ) {
    if (width === 0 || height === 0)
      throw new Error(`Buffer: width and height are required parameters!`);

    if (canvas) {
      this.#buffer = canvas.getContext("2d");
    } else {
      this.#buffer = new OffscreenCanvas(width, height).getContext("2d");
    }

    this.#color = color;
    if (color !== "transparent") {
      this.#buffer.fillStyle = this.#color;
      this.#buffer.fillRect(0, 0, width, height);
    }

    this.#buffer.imageSmoothingEnabled = false;
  }

  // readonly context
  get context() {
    return this.#buffer;
  }

  // readonly canvas
  get canvas() {
    return this.#buffer.canvas;
  }

  // readonly width
  get width() {
    return this.#buffer.canvas.width;
  }

  // readonly height
  get height() {
    return this.#buffer.canvas.height;
  }

  // color getter
  get color() {
    return this.#color;
  }

  // color setter
  set color(color = "transparent") {
    this.#buffer.fillStyle = color;
    this.#buffer.fillRect(0, 0, this.width, this.height);
  }

  clear() {
    this.#buffer.clearRect(0, 0, this.width, this.height);
  }
}

export default Buffer;
