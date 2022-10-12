// ThatWebdevDude - 2022

const DEFAULTS = {
  strokeStyle: "transparent",
  fillStyle: "#68c3d4",
  textAlign: "center",
  font: "16px Arial",
};

class CanvasRenderer {
  /**
   * Game Renderer model
   * This game renderer should be used for
   * any 2D canvas based HTML games.
   * @param {Number} width width in pixels of the game view
   * @param {Number} height height in pixels of the game view
   * @returns {CanvasRenderer}
   */
  constructor(
    { width = 832, height = 640 } = {
      width: 832,
      height: 640,
    }
  ) {
    if (CanvasRenderer.instance) {
      return CanvasRenderer.instance;
    } else {
      const canvas = document.createElement("canvas");
      this.height = canvas.height = height;
      this.width = canvas.width = width;
      this.view = canvas;
      this.context = canvas.getContext("2d");

      this.#init();

      CanvasRenderer.instance = this;
      return this;
    }
  }

  #init() {
    this.context.textBaseline = "top";
    this.context.imageSmoothingEnabled = false;
    document.addEventListener("keypress", (event) => {
      if (event.code === "KeyF") {
        this.#toggleFullscreen();
      }
    });
  }

  /**
   * toggleFullscreen()
   * fullscreen functionality to the current view (DOM canvas),
   * using the fullscreen api
   */
  #toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.view.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  /**
   * renderRecursive()
   * recursive render of all the childre of the
   * passed container to the current context.
   * @param {Container} container
   */
  #renderRecursive(container) {
    const { context } = this;
    container.children.forEach((child) => {
      if (child.visible == false) return;

      context.save();

      if (child.position) {
        context.translate(Math.round(child.position.x), Math.round(child.position.y));
      }

      if (child.anchor) {
        context.translate(child.anchor.x, child.anchor.y);
      }

      if (child.scale) {
        context.scale(child.scale.x, child.scale.y);
      }

      if (child.angle) {
        const { x: px, y: py } = child.pivot || { x: 0, y: 0 };
        context.translate(px, py);
        context.rotate(child.angle);
        context.translate(-px, -py);
      }

      // DEBUG -------------------------------------------------------------
      const drawText = (style) => {
        const { font, align } = style;
        context.textAlign = align || DEFAULTS.textAlign;
        context.font = font || DEFAULTS.font;
        context.fillText(child.text, 0, 0);
      };

      const drawCapsule = (style) => {
        const { width, height, radius } = child;
        const { stroke, fill } = style;
        context.strokeStyle = stroke || DEFAULTS.strokeStyle;
        context.fillStyle = fill || DEFAULTS.fillStyle;
        if (radius !== 0) {
          context.beginPath();
          context.roundRect(0, 0, width, height, radius);
          context.fill();
          context.stroke();
        } else {
          context.fillRect(0, 0, width, height);
        }
      };

      const drawPath = (style) => {
        if (child.path.length) {
          const [head, ...tail] = child.path;
          const { fill } = style;
          context.fillStyle = fill || DEFAULTS.fillStyle;
          context.beginPath();
          context.moveTo(head.x, head.y);
          tail.forEach(({ x, y }) => {
            context.lineTo(x, y);
          });
          if (tail.length === 1) {
            const { stroke } = style;
            context.strokeStyle = stroke || DEFAULTS.stroke;
            context.stroke();
          } else {
            // as polygon
            context.closePath();
            context.fill();
          }
        }
      };
      // END DEBUG ---------------------------------------------------------

      if (child.texture) {
        const { img } = child.texture;
        if (child.tileW && child.tileH) {
          context.drawImage(
            img,
            child.frame.x * child.tileW,
            child.frame.y * child.tileH,
            child.tileW,
            child.tileH,
            0,
            0,
            child.tileW,
            child.tileH
          );
        } else {
          context.drawImage(img, 0, 0);
        }
      } else if (child.style) {
        const { style } = child;
        if (child.text) {
          // ...text
          drawText(style);
        } else if (child.width && child.height) {
          // ...rect ...capsule ...circle
          drawCapsule(style);
        } else if (child.path) {
          // ...line ...polygon
          drawPath(style);
        }
      }

      // } else if (child.style && child.text) {
      //   drawText();
      // } else if (child.style && child.width && child.height) {
      //   const { stroke, fill } = child.style;
      //   context.strokeStyle = stroke || "transparent";
      //   context.fillStyle = fill || "black";
      //   if (child.radius) {
      //     // draw a capsule
      //     context.beginPath();
      //     context.roundRect(0, 0, child.width, child.height, child.radius);
      //     context.fill();
      //     context.stroke();
      //   } else {
      //     // draw a rectangle
      //     context.fillRect(0, 0, child.width, child.height);
      //   }
      // } else if (child.style && child.radius) {
      //   // draw a circle
      //   const { stroke, fill } = child.style;
      //   const { radius } = child;
      //   context.strokeStyle = stroke || "transparent";
      //   context.fillStyle = fill || "transparent";
      //   context.beginPath();
      //   context.arc(0, 0, radius, 0, Math.PI * 2, true);
      //   context.fill();
      //   context.stroke();
      // } else if (child.style && child.path) {
      //   // draw a path
      //   if (child.path.length) {
      //     const [head, ...tail] = child.path;
      //     const { style } = child;
      //     context.fillStyle = style.fill || "black";
      //     context.beginPath();
      //     context.moveTo(head.x, head.y);
      //     tail.forEach(({ x, y }) => {
      //       context.lineTo(x, y);
      //     });
      //     if (tail.length === 1) {
      //       // as line
      //       context.strokeStyle = style.stroke || "black";
      //       context.stroke();
      //     } else {
      //       // as polygon
      //       context.closePath();
      //       context.fill();
      //     }
      //   }
      // }

      if (child.children) {
        this.#renderRecursive(child);
      }

      context.restore();
    });
  }

  /**
   * render()
   * Traverse the container tree structure and renders the child nodes.
   * The container is passed in as parameter.
   * The clear flag set to true clears the context
   * before drawing the next frame.
   * @param {Container} container
   * @param {Boolean} clear
   */
  render(container, clear = true) {
    // prettier-ignore
    if (clear) {
      this.context.clearRect(
        0, 
        0, 
        this.width, 
        this.height
      );
    }
    this.#renderRecursive(container);
  }
}

export default CanvasRenderer;
