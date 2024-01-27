// implementation of a utility class which emits subscribed events at regular time intervals in seconds
class TimedEmitter {
  private _subscribers: Map<number, Function> = new Map();
  private _lastTime: number = 0;
  private _interval: number;

  constructor(interval: number) {
    this._interval = interval;
  }

  public subscribe(callback: Function): number {
    const id = Math.floor(Math.random() * Date.now());
    this._subscribers.set(id, callback);
    return id;
  }

  public unsubscribe(id: number): void {
    this._subscribers.delete(id);
  }

  public update(dt: number, t: number): void {
    this._lastTime += dt;
    if (this._lastTime >= this._interval) {
      this._lastTime = 0;
      this.emit();
    }
  }

  private emit(): void {
    this._subscribers.forEach((callback) => callback());
  }
}

export default TimedEmitter;
