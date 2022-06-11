import CanvasRenderer from "../renderers/CanvasRenderer";
import Container from "./Container";

const STEP = 1 / 60;
const MAX_FRAME = STEP * 5;

class Game {
  constructor(
    { width = 832, height = 640, parent = "#app" } = {
      width: 832,
      height: 640,
      parent: "#app",
    }
  ) {
    this.renderer = new CanvasRenderer(width, height);
    this.scene = new Container();
    this.width = width;
    this.height = height;

    // initialize
    document.querySelector(parent).appendChild(this.renderer.view);
  }

  run(gameUpdate = () => {}) {
    const { scene, renderer } = this;
    let t = 0;
    let dt = 0;
    let last = 0;

    const loop = (ms) => {
      requestAnimationFrame(loop);
      t = ms / 1000;
      dt = Math.min(t - last, MAX_FRAME * 5);
      last = t;
      scene.update(dt, t);
      gameUpdate(dt, t);
      renderer.render(scene);
    };

    requestAnimationFrame(loop);
  }
}

export default Game;
