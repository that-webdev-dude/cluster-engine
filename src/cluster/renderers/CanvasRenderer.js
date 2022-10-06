// ThatWebdevDude - 2022

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

      /**
       * Text:       .text
       * -----------------------------------------
       * Sprite:     .texture
       * Tilesprite: .texture .tileW .tileH
       * -----------------------------------------
       * Rect:       .style .width .height
       * -----------------------------------------
       * Circle:     .style .radius
       * Capsule:    .style .radius .length
       * -----------------------------------------
       * Polygon:    .style .path
       * Line        .style .path (if tail.length === 1)
       */

      if (child.text) {
        const { font, fill, align } = child.style;
        if (font) context.font = font;
        if (fill) context.fillStyle = fill;
        if (align) context.textAlign = align;
        context.fillText(child.text, 0, 0);
        // IMAGES
      } else if (child.texture) {
        // can be a tilesprite...
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
          // ...or regular sprite
          context.drawImage(img, 0, 0);
        }
        // SHAPES
      } else if (child.style && child.width && child.height) {
        const { stroke, fill } = child.style;
        context.strokeStyle = stroke || "transparent";
        context.fillStyle = fill || "black";
        if (child.radius) {
          // draw a capsule
          context.beginPath();
          context.roundRect(0, 0, child.width, child.height, child.radius);
          context.fill();
          context.stroke();
        } else {
          // draw a rectangle
          context.fillRect(0, 0, child.width, child.height);
        }
      } else if (child.style && child.radius) {
        // draw a circle
        const { stroke, fill } = child.style;
        const { radius } = child;
        context.strokeStyle = stroke || "transparent";
        context.fillStyle = fill || "transparent";
        context.beginPath();
        context.arc(0, 0, radius, 0, Math.PI * 2, true);
        context.fill();
        context.stroke();
      } else if (child.style && child.path) {
        // draw a path
        if (child.path.length) {
          const [head, ...tail] = child.path;
          const { style } = child;
          context.fillStyle = style.fill || "black";
          context.beginPath();
          context.moveTo(head.x, head.y);
          tail.forEach(({ x, y }) => {
            context.lineTo(x, y);
          });
          if (tail.length === 1) {
            // as line
            context.strokeStyle = style.stroke || "black";
            context.stroke();
          } else {
            // as polygon
            context.closePath();
            context.fill();
          }
        }
      }

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
