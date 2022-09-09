import Text from "../cluster/core/Text";
import Vector from "../cluster/utils/Vector";

class Timer extends Text {
  constructor(positionVec = new Vector(0, 0)) {
    super("aaa", {
      font: "20px 'Press Start 2p'",
      fill: "red",
      align: "center",
    });

    this.time = 0;
    this.running = true;
    this.position.copy(positionVec);
  }

  stop() {
    this.running = false;
  }

  reset() {
    this.time = 0;
    this.running = true;
  }

  update(dt, t) {
    if (this.running) {
      this.time += dt;
      this.text = `${this.time.toFixed(3)}`;
    }
  }
}

export default Timer;
