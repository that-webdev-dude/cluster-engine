class State {
  constructor(initialState) {
    this.current = initialState;
    this.previous = null;
    this.changed = false;
    this.first = false;
    this.time = 0;
  }

  is([...states]) {
    console.log("file: State.js ~ line 11 ~ State ~ is ~ states", states);
    // return states.some((s) => this.current === s);
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
