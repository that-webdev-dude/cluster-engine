// 2024 @that-webdev-dude
// Engine.ts
// A fixed time step game loop that uses requestAnimationFrame to update and render the game at a consistent frame rate.

type EngineOptions = {
  update?: (dt: number, t: number) => void;
  render?: () => void;
  fps?: number;
};

export class Engine {
  private _frameRequest: number | null;
  private _currentTime: number | null;
  private _elapsedTime: number;
  private _timeStep: number;
  private _updated: boolean;
  private _updates: number;
  private _update: (dt: number, t: number) => void;
  private _render: () => void;

  constructor(config: EngineOptions = {}) {
    const { update = () => {}, render = () => {}, fps = 60 } = config;
    this._frameRequest = null;
    this._currentTime = null;
    this._elapsedTime = 0;
    this._updated = false;
    this._timeStep = 1000 / fps;
    this._updates = 0;
    this._update = update;
    this._render = render;
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
      // this._render();
      this._updated = false;
    }
  };

  public start() {
    if (this._frameRequest === null) {
      this._currentTime = window.performance.now();
      this._frameRequest = window.requestAnimationFrame(this._run);
    }
  }

  public stop() {
    if (this._frameRequest !== null) {
      window.cancelAnimationFrame(this._frameRequest);
      this._frameRequest = null;
    }
  }
}

export default Engine;
