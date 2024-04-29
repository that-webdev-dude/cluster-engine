type TimerConfig = {
  duration: number;
  onTick: TimerCallback;
  onDone?: SimpleCallback | undefined;
  delay?: number;
};

const DEFAULT_DURATION = 1;
const DEFAULT_DELAY = 0;

type SimpleCallback = () => void;
type TimerCallback = (ratio: number) => void;

export class Timer {
  private _duration: number;
  private _onTick: TimerCallback;
  private _onDone: SimpleCallback | undefined;
  private _elapsed: number;
  private _delay: number;
  private _dead: boolean;

  constructor({
    duration = DEFAULT_DURATION,
    delay = DEFAULT_DELAY,
    onTick = () => {},
    onDone,
  }: TimerConfig) {
    this._duration = duration;
    this._delay = delay;
    this._onTick = onTick;
    this._onDone = onDone;
    this._elapsed = 0;
    this._dead = false;
  }

  get elapsed(): number {
    return this._elapsed;
  }

  get dead(): boolean {
    return this._dead;
  }

  public update(dt: number): void {
    if (this._dead) return;
    if (this._delay > 0) {
      this._delay -= dt;
      return;
    }
    this._elapsed += dt;
    const ratio = this._elapsed / this._duration;
    if (ratio >= 1) {
      this._onTick(1);
      this._onDone?.();
      this._dead = true;
    } else {
      this._onTick(ratio);
    }
  }

  public reset(duration?: number, delay?: number): void {
    if (duration) this._duration = duration;
    if (delay) this._delay = delay;
    this._elapsed = 0;
    this._dead = false;
  }
}
