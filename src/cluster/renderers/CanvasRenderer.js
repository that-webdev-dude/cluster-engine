class CanvasRenderer {
  constructor(width, height) {
    const canvas = document.createElement("canvas");
    this.height = canvas.height = height;
    this.width = canvas.width = width;
    this.view = canvas;
    this.context = canvas.getContext("2d");

    this.context.textBaseline = "top";
    this.context.imageSmoothingEnabled = false;
  }

  render(container) {
    const { context: ctx } = this;
    function renderRecursive(container) {
      //   render the container children
      container.children.forEach((child) => {
        ctx.save();
        // draw the leaf node
        if (child.position) {
          ctx.translate(Math.round(child.position.x), Math.round(child.position.y));
        }

        if (child.text) {
          const { font, fill, align } = child.style;
          if (font) ctx.font = font;
          if (fill) ctx.fillStyle = fill;
          if (align) ctx.textAlign = align;
          ctx.fillText(child.text, 0, 0);
        }

        // handle the child types
        if (child.children) {
          renderRecursive(child);
        }
        ctx.restore();
      });
    }
    ctx.clearRect(0, 0, this.width, this.height);
    renderRecursive(container);
  }
}

export default CanvasRenderer;
