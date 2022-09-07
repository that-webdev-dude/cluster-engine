import CanvasRenderer from "../renderers/CanvasRenderer";
import Container from "./Container";

const STEP = 1 / 60;
const MULTIPLIER = 1;
const MAX_FRAME = STEP * 3;
const SPEED = STEP * MULTIPLIER;

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
    this.#renderer = new CanvasRenderer({
      height,
      width,
    });

    this.debug_updates = 0;

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
    let t = 0;
    let dt = 0;
    let last = 0;

    const loop = (ms) => {
      requestAnimationFrame(loop);
      t = ms / 1000;
      dt += Math.min(t - last, MAX_FRAME * 5);
      last = t;

      while (dt >= SPEED) {
        this.scene.update(STEP, t / MULTIPLIER);
        gameUpdate(STEP, t / MULTIPLIER);
        dt -= SPEED;
        // this.debug_updates++;
      }

      // console.log("file: Game.js ~ line 58 ~ Game ~ loop ~ this.debug_updates", this.debug_updates);
      this.#renderer.render(this.scene);
      // this.debug_updates = 0;
    };

    const init = (ms) => {
      last = ms / 1000;
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(init);
  }
}

export default Game;
