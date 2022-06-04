import Buffer from "./Buffer";

/**
 * Game display (singleton)
 *
 * A DOM canvas object is required to initialize the game display.
 * The DOM canvas must be passed as parameter in the config object.
 * Width & height are also required in order to keep
 * the same aspect ratio on window "resize".
 * The Display aspect ratio will be set based
 * on the given width and height.
 * By pressing "F" Display will go in fullscreen mode.
 */
class Display extends Buffer {
  #aspectRatio = null;
  #maxWidth = null;

  constructor(
    { canvas = null, width = 832, height = 640, color = "transparent" } = {
      canvas: null,
      width: 832,
      height: 640,
      color: "transparent",
    }
  ) {
    if (Display.instance) {
      return Display.instance;
    } else {
      super({ canvas, width, height, color });

      this.#maxWidth = width;
      this.#aspectRatio = height / width;

      this.#init();

      Display.instance = this;
      return this;
    }
  }

  /**
   * to initialize this display
   * by just adding the required listeners
   */
  #init() {
    this.#resize();

    window.addEventListener("keypress", (event) => {
      if (event.code === "KeyF") {
        this.#toggleFullscreen();
      }
    });

    window.addEventListener("resize", (e) => {
      e.preventDefault();
      if (!document.fullscreenElement) {
        this.#resize();
      }
    });
  }

  /**
   * to add the fullscreen functionality to this display
   * using the fullscreen api
   */
  #toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.canvas.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  /**
   * to add resize functionality to this display
   */
  #resize() {
    const { innerWidth: width, innerHeight: height } = window;
    let newWidth,
      newHeight = 0;
    if (height / width >= this.#aspectRatio) {
      newWidth = width;
      newHeight = width * this.#aspectRatio;
    } else {
      newWidth = height / this.#aspectRatio;
      newHeight = height;
    }

    if (newWidth >= this.#maxWidth) {
      this.canvas.width = this.#maxWidth;
      this.canvas.height = this.#maxWidth * this.#aspectRatio;
    } else {
      this.canvas.width = newWidth;
      this.canvas.height = newHeight;
    }
  }
}

export default Display;
