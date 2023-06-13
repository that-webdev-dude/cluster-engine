class Engine {
  #frameRequest;
  #currentTime;
  #elapsedTime;
  #timeStep;
  #updated;
  #updates;
  #update;
  #render;
  #panic;

  /**
   * Fixed time step game engine (Singleton).
   *
   * Can be used for any game and ensures that the game state is
   * updated at the same timestep across different devices.
   * In case of slow devices, a memory spiral catch is in place
   * to never allow three full frames passing without an update.
   *
   * @param {Function} update - update function
   * @param {Function} render - render function
   *
   * @method start()
   * @method stop()
   */
  constructor(update = () => {}, render = () => {}) {
    if (Engine.instance) {
      return Engine.instance;
    } else {
      this.#frameRequest = null;
      this.#currentTime = null;
      this.#elapsedTime = 0;
      this.#timeStep = 1000 / 60;
      this.#updated = false;
      this.#updates = 0;
      this.#update = update;
      this.#render = render;
      this.#panic = () => console.log("PANIC!");

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
    this.#updates = 0;

    if (this.#elapsedTime >= this.#timeStep * 3) {
      this.#elapsedTime = this.#timeStep;
    }

    while (this.#elapsedTime >= this.#timeStep) {
      this.#elapsedTime -= this.#timeStep;
      this.#update(this.#timeStep);
      if (++this.#updates > 2) {
        this.#panic();
        break;
      }
      this.#updated = true;
    }

    if (this.#updated) {
      this.#render(this.#timeStep);
      this.#updated = false;
    }
  }

  onUpdate(onUpdateFunc = () => {}) {
    this.#update = onUpdateFunc;
    return this;
  }

  onRender(onRenderFunc = () => {}) {
    this.#render = onRenderFunc;
    return this;
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
}

export default Engine;
