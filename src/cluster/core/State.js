class State {
  constructor(initialState) {
    this.current = initialState;
    this.previous = null;
    this.changed = true;
    this.first = true;
    this.time = 0;
  }

  is([...states]) {
    return states.some((s) => this.current === s);
  }

  get() {
    return this.current;
  }

  set(state) {
    this.previous = this.state;
    this.current = state;
    this.changed = true;
    this.time = 0;
  }

  update(dt, t) {
    this.first = this.changed;
    this.changed = false;
    this.time += dt;
  }
}

export default State;
