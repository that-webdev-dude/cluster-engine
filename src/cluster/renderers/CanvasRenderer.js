// ThatWebdevDude - 2022

class CanvasRenderer {
  /**
   * @description
   * Game Renderer model
   * This game renderer should be used for
   * any 2D canvas based HTML games
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
   * toggleFullscreen():
   * to add the fullscreen functionality to this display
   * using the fullscreen api
   * @returns {Void}
   * @private
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
   * renderRecursive():
   * recursive render of all the childre of the
   * passed container to the current context.
   * @param {Container} container
   * @returns {Void}
   * @private
   */
  #renderRecursive(container) {
    container.children.forEach((child) => {
      if (child.visible == false) return;

      this.context.save();

      if (child.position) {
        this.context.translate(Math.round(child.position.x), Math.round(child.position.y));
      }

      if (child.anchor) {
        this.context.translate(child.anchor.x, child.anchor.y);
      }

      if (child.scale) {
        this.context.scale(child.scale.x, child.scale.y);
      }

      if (child.angle) {
        const { x: px, y: py } = child.pivot;
        this.context.translate(px, py);
        this.context.rotate((Math.PI / 180) * child.angle);
        this.context.translate(-px, -py);
      }

      if (child.text) {
        const { font, fill, align } = child.style;
        if (font) this.context.font = font;
        if (fill) this.context.fillStyle = fill;
        if (align) this.context.textAlign = align;
        this.context.fillText(child.text, 0, 0);
      } else if (child.texture) {
        // can be a tilesprite...
        const { img } = child.texture;
        if (child.tileW && child.tileH) {
          this.context.drawImage(
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
          this.context.drawImage(img, 0, 0);
        }
      }

      if (child.children) {
        this.#renderRecursive(child);
      }

      this.context.restore();
    });
  }

  /**
   * render():
   * Traverse the container tree structure and renders the child nodes.
   * The container is passed in as parameter.
   * The clear flag set to true clears the context
   * before drawing the next frame.
   * @param {Container} container
   * @param {Boolean} clear
   * @returns {Void}
   * @public
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
