export class State<T> {
  private _current: T;
  private _previous: T | null;
  private _changed: boolean;
  private _first: boolean;
  private _time: number;

  constructor(initialState: T) {
    this._current = initialState;
    this._previous = null;
    this._changed = true;
    this._first = true;
    this._time = 0;
  }

  get first() {
    return this._first;
  }

  is(states: T[]): boolean {
    return states.some((s) => this._current === s);
  }

  get(): T {
    return this._current;
  }

  set(state: T): void {
    this._previous = this._current;
    this._current = state;
    this._changed = true;
    this._time = 0;
  }

  update(dt: number): void {
    this._first = this._changed;
    this._changed = false;
    this._time += dt;
  }
}

export default State;
