class Engine {
  #frameRequest;
  #currentTime;
  #elapsedTime = 0;
  #timeStep = 1000 / 60;
  #updated = false;
  #update;
  #render;
  #onUpdate = (dt, t) => {};
  #onRender = () => {};

  /**
   * Fixed time step game engine (Singleton).
   *
   * Can be used for any game and ensures that the game state is
   * updated at the same timestep across different devices.
   *
   * @param {Object} options - The engine options.
   * @param {Function} options.update - The update function.
   * @param {Function} options.render - The render function.
   */
  constructor({ update = () => {}, render = () => {} } = {}) {
    if (Engine.instance) {
      return Engine.instance;
    } else {
      this.#frameRequest = null;
      this.#currentTime = null;
      this.#update = update;
      this.#render = render;

      Engine.instance = this;
      return Engine.instance;
    }
  }

  #run(timestamp) {
    if (!this.#currentTime) this.#currentTime = window.performance.now();
    this.#frameRequest = window.requestAnimationFrame((timestamp) => {
      this.#run(timestamp);
    });

    this.#elapsedTime += timestamp - this.#currentTime;
    this.#currentTime = timestamp;

    let t = this.#currentTime / 1000;
    let dt = this.#timeStep / 1000;
    let updates = 0;
    while (this.#elapsedTime >= this.#timeStep) {
      this.#update(dt, t);
      this.#onUpdate(dt, t);
      this.#elapsedTime -= this.#timeStep;
      this.#updated = true;
      if (++updates > 3) {
        console.warn("WARNING: Engine.js ~ number of updates exceeding 2");
        break;
      }
    }

    if (this.#updated) {
      this.#render(this.#timeStep);
      this.#onRender();
      this.#updated = false;
    }
  }

  start() {
    this.#currentTime = window.performance.now();
    this.#frameRequest = window.requestAnimationFrame((timestamp) => {
      this.#run(timestamp);
    });
  }

  stop() {
    window.cancelAnimationFrame(this.#frameRequest);
  }

  set update(update) {
    this.#update = update;
  }

  set render(render) {
    this.#render = render;
  }

  set onUpdate(onUpdate) {
    this.#onUpdate = onUpdate;
  }

  set onRender(onRender) {
    this.#onRender = onRender;
  }
}

export default Engine;
