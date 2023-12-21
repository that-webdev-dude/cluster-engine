interface ITimerConfig {
  duration: number;
  onTick: Function;
  onDone?: Function;
  delay?: number;
}

class Timer {
  private _duration: number;
  private _onTick: Function;
  private _onDone: Function;
  private _delay: number;
  private _elapsed: number;
  public dead: boolean;

  constructor({
    duration = 1,
    delay = 0,
    onTick = () => {},
    onDone = () => {},
  }: ITimerConfig) {
    this._duration = duration;
    this._delay = delay;
    this._onTick = onTick;
    this._onDone = onDone;
    this._elapsed = 0;
    this.dead = false;
  }

  public update(dt: number, t: number) {
    const { _duration, _onTick, _onDone, _delay } = this;
    if (this._delay > 0) {
      this._delay -= dt;
      return;
    }
    this._elapsed += dt;
    const ratio = this._elapsed / _duration;
    if (ratio >= 1) {
      _onTick(1);
      _onDone && _onDone();
      this.dead = true;
    } else {
      _onTick(ratio);
    }
  }
}

export default Timer;
