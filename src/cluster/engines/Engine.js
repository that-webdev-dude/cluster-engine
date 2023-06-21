class Engine {
  #frameRequest;
  #currentTime;
  #elapsedTime;
  #timeStep;
  #updated;
  #update;
  #render;
  #onUpdate;
  #onRender;

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
  // constructor(update = () => {}, render = () => {}) {
  constructor(
    { update = () => {}, render = () => {} } = {
      update: () => {},
      render: () => {},
    }
  ) {
    if (Engine.instance) {
      return Engine.instance;
    } else {
      this.#frameRequest = null;
      this.#currentTime = null;
      this.#elapsedTime = 0;
      this.#timeStep = 1000 / 60;
      this.#updated = false;
      this.#update = update;
      this.#render = render;
      this.#onUpdate = null;
      this.#onRender = null;

      // ...
      // this.previousFrameTime = 0;
      // this.elapsedFrameTime = 0;
      // this.frames = 0;
      // this.ups = 0;
      // ...

      Engine.instance = this;
      return Engine.instance;
    }
  }

  #run(timestamp, done) {
    if (!this.#currentTime) this.#currentTime = window.performance.now();
    this.#frameRequest = window.requestAnimationFrame((timestamp) => {
      this.#run(timestamp);
    });

    this.#elapsedTime += timestamp - this.#currentTime;
    this.#currentTime = timestamp;
    if (this.#elapsedTime >= this.#timeStep * 3) {
      this.#elapsedTime = this.#timeStep;
    }

    let t = this.#currentTime / 1000;
    let dt = this.#timeStep / 1000;
    let updates = 0;
    while (this.#elapsedTime >= this.#timeStep) {
      this.#update(dt, t); // dt & t in milliseconds
      this.#onUpdate(dt, t);
      this.#elapsedTime -= this.#timeStep;
      this.#updated = true;
      if (++updates > 2) {
        console.warn("WARNING: Engine.js ~ number of updates exceeding 2");
        break;
      }
      // ...
      // this.frames++;
      // ...
    }

    if (this.#updated) {
      this.#render(this.#timeStep);
      this.#onRender();
      this.#updated = false;
    }

    // ...
    // let now = this.#currentTime;
    // this.elapsedFrameTime = now - this.previousFrameTime;
    // if (this.elapsedFrameTime >= 1000) {
    //   this.ups = this.frames / (this.elapsedFrameTime / 1000);
    //   this.frames = 0;
    //   this.previousFrameTime = now;
    //   console.log("file: app.js:44 ~ Engine ~ loop ~ this.ups:", this.ups);
    // }
    // ...
  }

  start(onUpdate = (dt, t) => {}, onRender = () => {}) {
    this.#onUpdate = onUpdate;
    this.#onRender = onRender;
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
