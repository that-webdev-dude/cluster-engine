import CanvasRenderer from "../renderers/CanvasRenderer";
import Container from "./Container";
import Assets from "./Assets";

let STEP = 1 / 60;
let MULTIPLIER = 1;
let MAX_FRAME = STEP * 5;
let SPEED = STEP * MULTIPLIER;

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

    this.destinationScene = null; // destination scene reference for fading scenes
    this.fadeDuration = 0;
    this.fadeTime = 0;

    // DEGUG
    this.debug_updates = 0;

    // initialize
    document.querySelector(parent).appendChild(this.#renderer.view);
  }

  get speed() {
    return MULTIPLIER;
  }

  set speed(speed) {
    MULTIPLIER = speed;
    SPEED = STEP * MULTIPLIER;
  }

  get height() {
    return this.#renderer.height;
  }

  get width() {
    return this.#renderer.width;
  }

  get view() {
    return this.#renderer.view;
  }

  get ctx() {
    return this.#renderer.context;
  }

  /**
   * for the screen transition
   * @param {*} scene
   * @param {*} duration
   * @returns
   */
  setScene(scene, duration = 0) {
    if (!duration) {
      this.scene = scene;
      return;
    }
    this.destinationScene = scene;
    this.fadeDuration = duration;
    this.fadeTime = duration;
  }

  run(gameUpdate = () => {}) {
    Assets.onReady(() => {
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
        }

        this.#renderer.render(this.scene);
        // scene transition
        if (this.fadeTime > 0) {
          const { fadeDuration } = this;
          const ratio = this.fadeTime / fadeDuration;
          this.scene.alpha = ratio;
          this.destinationScene.alpha = 1 - ratio;
          this.#renderer.render(this.destinationScene, false);
          if ((this.fadeTime -= STEP) <= 0) {
            this.scene = this.destinationScene;
            this.destinationScene = null;
          }
        }
      };

      const init = (ms) => {
        last = ms / 1000;
        requestAnimationFrame(loop);
      };

      requestAnimationFrame(init);
    });
  }
}

export default Game;
