class Engine {
  private static instance: Engine;
  private frameRequest!: number | null;
  private currentTime!: number | null;
  private elapsedTime: number = 0;
  private timeStep: number = 1000 / 60;
  private updated: boolean = false;
  private update!: (dt: number, t: number) => void;
  private render!: (timeStep: number) => void;
  private onUpdate: (dt: number, t: number) => void = (dt, t) => {};
  private onRender: () => void = () => {};

  constructor({
    update = () => {},
    render = () => {},
  }: {
    update?: (dt: number, t: number) => void;
    render?: (timeStep: number) => void;
  } = {}) {
    if (Engine.instance) {
      return Engine.instance;
    } else {
      this.frameRequest = null;
      this.currentTime = null;
      this.update = update;
      this.render = render;

      Engine.instance = this;
      return Engine.instance;
    }
  }

  private run(timestamp: number): void {
    if (!this.currentTime) this.currentTime = window.performance.now();
    this.frameRequest = window.requestAnimationFrame((timestamp) => {
      this.run(timestamp);
    });

    this.elapsedTime += timestamp - (this.currentTime || timestamp);
    this.currentTime = timestamp;

    let t = this.currentTime / 1000;
    let dt = this.timeStep / 1000;
    let updates = 0;
    while (this.elapsedTime >= this.timeStep) {
      this.update(dt, t);
      this.onUpdate(dt, t);
      this.elapsedTime -= this.timeStep;
      this.updated = true;
      if (++updates > 3) {
        console.warn("WARNING: Engine.ts ~ number of updates exceeding 2");
        break;
      }
    }

    if (this.updated) {
      this.render(this.timeStep);
      this.onRender();
      this.updated = false;
    }
  }

  public start(): void {
    this.currentTime = window.performance.now();
    this.frameRequest = window.requestAnimationFrame((timestamp) => {
      this.run(timestamp);
    });
  }

  public stop(): void {
    if (this.frameRequest !== null) {
      window.cancelAnimationFrame(this.frameRequest);
    }
  }

  public setUpdate(update: (dt: number, t: number) => void): void {
    this.update = update;
  }

  public setRender(render: (timeStep: number) => void): void {
    this.render = render;
  }

  public setOnUpdate(onUpdate: (dt: number, t: number) => void): void {
    this.onUpdate = onUpdate;
  }

  public setOnRender(onRender: () => void): void {
    this.onRender = onRender;
  }
}

export default Engine;
