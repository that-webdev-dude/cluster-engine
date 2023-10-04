import CanvasRenderer from "../renderers/CanvasRenderer";
import Engine from "../engines/EngineOptimized";
import Assets from "./Assets";
import Container from "./Container";
import Debugger from "./Debugger";

let STEP = 1 / 60;
let MULTIPLIER = 1;
let MAX_FRAME = STEP * 5;
let SPEED = STEP * MULTIPLIER;

class Game {
  #renderer;
  #engine;

  constructor(
    {
      title = "Game",
      version = "1.0.0",
      width = 832,
      height = 640,
      parent = "#app",
    } = {
      title: "Game",
      version: "1.0.0",
      width: 832,
      height: 640,
      parent: "#app",
    }
  ) {
    this.title = title;
    this.version = version;
    this.scene = new Container();
    this.#engine = new Engine();
    this.#renderer = new CanvasRenderer({
      height,
      width,
    });

    this.destinationScene = null; // destination scene reference for fading scenes
    this.fadeDuration = 0;
    this.fadeTime = 0;

    // initialize FPS counter
    this.lastFPSUpdate = 0;
    this.currentFPS = 0;
    this.frames = 0;

    // initialize
    document.querySelector(parent).appendChild(this.#renderer.view);
  }

  get speed() {
    return MULTIPLIER;
  }

  set speed(speed) {
    MULTIPLIER = speed;
    SPEED = STEP / MULTIPLIER;
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

  get FPS() {
    return this.currentFPS;
  }

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
      const loop = (ms) => {
        t = ms / 1000;
        dt += Math.min(t - last, MAX_FRAME * 5);
        last = t;

        while (dt >= SPEED) {
          this.scene.update(STEP, t / MULTIPLIER);
          gameUpdate(STEP, t / MULTIPLIER);
          dt -= SPEED;

          // FPS Counter
          this.frames++;
          if (ms - this.lastFPSUpdate > 1000) {
            // Check every second
            this.currentFPS = this.frames;
            this.frames = 0;
            this.lastFPSUpdate = ms;
          }
        }

        // the renderer will be called at the same refresh rate as the screen
        this.#renderer.render(this.scene);

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

        requestAnimationFrame(loop);
      };

      let t = 0;
      let dt = 0;
      let last = 0;
      requestAnimationFrame(loop);
    });
  }
}

export default Game;
