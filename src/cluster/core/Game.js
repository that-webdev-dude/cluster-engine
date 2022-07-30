import CanvasRenderer from "../renderers/CanvasRenderer";
import Container from "./Container";

const STEP = 1 / 60;
const MAX_FRAME = STEP * 5;

class Game {
  #renderer;

  constructor(
    { width = 832, height = 640, parent = "#app" } = {
      width: 832,
      height: 640,
      parent: "#app",
    }
  ) {
    this.scene = new Container();
    this.#renderer = new CanvasRenderer(width, height);

    // initialize
    document.querySelector(parent).appendChild(this.#renderer.view);
  }

  get height() {
    return this.#renderer.height;
  }

  get width() {
    return this.#renderer.width;
  }

  run(gameUpdate = () => {}) {
    // const { #renderer } = this;
    let t = 0;
    let dt = 0;
    let last = 0;

    const loop = (ms) => {
      requestAnimationFrame(loop);
      t = ms / 1000;
      dt = Math.min(t - last, MAX_FRAME * 5);
      last = t;
      this.scene.update(dt, t);
      gameUpdate(dt, t);
      this.#renderer.render(this.scene);
    };

    requestAnimationFrame(loop);
  }
}

export default Game;
