interface EngineOptions {
  update?: (dt: number, t: number) => void;
  render?: () => void;
  fps?: number;
}

class Engine {
  private _frameRequest: number | null;
  private _currentTime: number | null;
  private _elapsedTime: number;
  private _timeStep: number;
  private _updated: boolean;
  private _updates: number;
  private _update: (dt: number, t: number) => void;
  private _render: () => void;

  constructor(options: EngineOptions = {}) {
    this._frameRequest = null;
    this._currentTime = null;
    this._elapsedTime = 0;
    this._updated = false;
    this._updates = 0;
    this._updates = 0;
    this._timeStep = 1000 / (options.fps ?? 60);
    this._update = options.update ?? (() => {});
    this._render = options.render ?? (() => {});
  }

  set update(update: (dt: number, t: number) => void) {
    this._update = update;
  }

  set render(render: () => void) {
    this._render = render;
  }

  private _run = (timestamp: number) => {
    if (!this._currentTime) this._currentTime = window.performance.now();
    this._frameRequest = window.requestAnimationFrame(this._run);

    this._elapsedTime += timestamp - this._currentTime;
    this._currentTime = timestamp;
    this._updates = 0;

    if (this._elapsedTime >= this._timeStep * 3) {
      this._elapsedTime = this._timeStep;
    }

    while (this._elapsedTime >= this._timeStep) {
      this._elapsedTime -= this._timeStep;
      this._update(this._timeStep / 1000, this._currentTime / 1000);
      if (++this._updates > 2) {
        throw new Error("Engine (46): Too many updates!");
      }
      this._updated = true;
    }

    if (this._updated) {
      this._render();
      this._updated = false;
    }
  };

  public start() {
    this._currentTime = window.performance.now();
    this._frameRequest = window.requestAnimationFrame(this._run);
  }

  public stop() {
    if (this._frameRequest !== null) {
      window.cancelAnimationFrame(this._frameRequest);
    }
  }
}

export default Engine;
