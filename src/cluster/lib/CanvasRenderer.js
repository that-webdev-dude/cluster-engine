/**
 * Canvas Buffer:
 * Generic offscreen/onscreen canvas.
 * Width and Height are required parameters;
 * if the id parameter is passed in, the canvas
 * will be taken from the DOM and will be onscreen
 */
class CanvasRenderer {
  #buffer;

  constructor(
    { canvas = null, width = 0, height = 0 } = {
      canvas: null,
      width: 0,
      height: 0,
    }
  ) {
    if (width === 0 || height === 0)
      throw new Error(`Buffer: width and height are required parameters!`);

    if (canvas) {
      this.#buffer = canvas.getContext("2d");
    } else {
      this.#buffer = new OffscreenCanvas(width, height).getContext("2d");
    }

    this.#buffer.imageSmoothingEnabled = false;
  }

  // readonly context
  get context() {
    return this.#buffer;
  }

  // readonly canvas
  get view() {
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

  render(container) {
    const { context } = this;

    function renderRec(container) {
      // render the container children
      container.children.forEach((child) => {
        context.save();
        if (child.children) renderRec(child);
        if (child.position)
          context.translate(
            Math.round(child.position.x),
            Math.round(child.position.y)
          );
        if (child.text) {
          const { font, fill, align } = child.style;
          if (font) context.font = font;
          if (fill) context.fillStyle = fill;
          if (align) context.textAlign = align;
          context.fillText(child.text, 0, 0);
        }
        context.restore();
      });
    }

    context.clearRect(0, 0, this.width, this.height);
    renderRec(container);
  }
}

export default CanvasRenderer;
