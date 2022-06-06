class CanvasRenderer {
  constructor(width, height) {
    // renderer state
    // it makes a new canvas element with alias "view"
    // the canvas dimensions are passed in the constructor
    // the state holds a reference to the context
    const canvas = document.createElement("canvas");
    this.height = canvas.height = height;
    this.width = canvas.width = width;
    this.view = canvas;
    this.context = canvas.getContext("2d");

    // here we set the text baseline property to top
    // for consistency with all the other elements rendered on the canvas
    // no smoothing is allowed as well
    this.context.textBaseline = "top";
    this.context.imageSmoothingEnabled = false;
  }

  /**
   * traverse the container tree structure and renders the leaf nodes.
   * the container is passed in as parameter.
   * the clear flag handles the context clearRect
   * @param {*} container
   * @param {*} clear
   */
  render(container, clear = true) {
    const { context: ctx } = this;

    function renderRecursive(container) {
      container.children.forEach((child) => {
        // if not visible shouldn't be processed
        if (child.visible == false) return;
        ctx.save();
        // translates the context origin
        // if the child has a position property
        if (child.position)
          ctx.translate(Math.round(child.position.x), Math.round(child.position.y));
        // if child is type Text...
        if (child.text) {
          const { font, fill, align } = child.style;
          if (font) ctx.font = font;
          if (fill) ctx.fillStyle = fill;
          if (align) ctx.textAlign = align;
          ctx.fillText(child.text, 0, 0);
        }
        // if child is a container...
        if (child.children) renderRecursive(child);
        ctx.restore();
      });
    }

    if (clear) ctx.clearRect(0, 0, this.width, this.height);
    renderRecursive(container);
  }
}

export default CanvasRenderer;
