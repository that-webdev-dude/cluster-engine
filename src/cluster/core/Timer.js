class Timer {
  constructor(duration = 1, onTick = () => {}, onDone = () => {}, delay = 0) {
    this.duration = duration;
    this.onTick = onTick;
    this.onDone = onDone;
    this.delay = delay;
    this.elapsed = 0;
    this.visible = false;
    this.dead = false;
  }

  update(dt, t) {
    const { duration, onTick, onDone, delay } = this;
    if (this.delay > 0) {
      this.delay -= dt;
      return;
    }
    this.elapsed += dt;
    const ratio = this.elapsed / duration;
    if (ratio >= 1) {
      onTick(1);
      onDone && onDone();
      this.dead = true;
    } else {
      onTick(ratio);
    }
  }
}

export default Timer;
