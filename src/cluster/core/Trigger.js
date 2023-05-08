import Rect from "../shapes/Rect";
import Vector from "../utils/Vector";

class Trigger {
  constructor(hitbox, onCollide, debug = true) {
    this.hitbox = hitbox;
    this.position = new Vector(0, 0);
    this.onCollide = onCollide;
    this.onEnter = null; // TODO
    this.onExit = null; // TODO

    if (debug) {
      const { width, height } = hitbox;
      this.children = [
        new Rect({
          width: width,
          height: height,
          style: {
            fill: "transparent",
            stroke: "red",
          },
        }),
      ];
    }
  }

  trigger() {
    this?.onCollide();
  }
}

export default Trigger;
