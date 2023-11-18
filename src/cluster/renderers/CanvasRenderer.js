// ThatWebdevDude - 2022

const isOnCamera = (child, camera) => {
  return (
    child.position.x + child.width >= camera.position.x &&
    child.position.y + child.height >= camera.position.y &&
    child.position.x <= camera.position.x + camera.width &&
    child.position.y <= camera.position.y + camera.height
  );
};

/**
 * canvas defaults styles
 */
const DEFAULTS = {
  strokeStyle: "transparent",
  lineWidth: 1,
  fillStyle: "#68c3d4",
  textAlign: "center",
  font: '10px "Press Start 2P"',
};

/**
 * static collection draw functions
 */
class CanvasArtist {
  static drawText = (context, child) => {
    const { text, style } = child;
    const { fill, font, align } = style;
    context.font = font || DEFAULTS.font;
    context.fillStyle = fill || DEFAULTS.fillStyle;
    context.textAlign = align || DEFAULTS.textAlign;
    context.fillText(text, 0, 0);
  };

  static drawCapsule = (context, child) => {
    const { style } = child;
    const { stroke, fill, lineWidth } = style;
    const { width, height, radius } = child;
    context.fillStyle = fill || DEFAULTS.fillStyle;
    context.lineWidth = lineWidth || DEFAULTS.lineWidth;
    context.strokeStyle = stroke || DEFAULTS.strokeStyle;

    if (radius > 0.001) {
      context.beginPath();
      context.roundRect(0, 0, width, height, radius);
      context.stroke();
      context.fill();
    } else {
      context.beginPath();
      context.rect(0, 0, width, height);
      context.stroke();
      context.fill();
    }
  };

  static drawPath = (context, child) => {
    const { style } = child;
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
        const { stroke, lineWidth } = style;
        context.lineWidth = lineWidth || DEFAULTS.lineWidth;
        context.strokeStyle = stroke || DEFAULTS.fillStyle;
        context.stroke();
      } else {
        context.closePath();
        context.fill();
      }
    }
  };
}

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

  /**
   * setup the output canvas
   */
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
  #renderRecursive(container, camera = null) {
    // exit immediately if the whole container is transparent
    if (container.visible === false || container.alpha === 0) return;

    const { context } = this;
    if (container.alpha) {
      context.save();
      context.globalAlpha = container.alpha;
    }

    container.children.forEach((child) => {
      // exit immediately if the child is transparent
      if (child.visible == false || child.alpha === 0) return;

      // exit immediately if the whole container is offscreen (camera or viewport bounds)
      if (camera && !isOnCamera(child, camera)) {
        return;
      } else {
        if (
          child.position?.x + child.width < 0 ||
          child.position?.x > this.width ||
          child.position?.y + child.height < 0 ||
          child.position?.y > this.height
        ) {
          console.log("out of bounds");
          return;
        }
      }

      context.save();

      if (child.alpha) {
        context.globalAlpha = child.alpha;
      }

      if (child.position) {
        context.translate(
          Math.round(child.position.x),
          Math.round(child.position.y)
        );
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
        if (child.text) {
          CanvasArtist.drawText(context, child);
        } else if (child.width && child.height && child.radius) {
          CanvasArtist.drawCapsule(context, child);
        } else if (child.path) {
          CanvasArtist.drawPath(context, child);
        }
      } else if (child.canvas) {
        context.drawImage(child.canvas, 0, 0);
      }

      if (child.children) {
        if (child.worldSize) {
          const camera = child;
          this.#renderRecursive(child, camera);
        } else {
          this.#renderRecursive(child);
        }
      }

      context.restore();
    });

    if (container.alpha) {
      context.restore();
    }
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
