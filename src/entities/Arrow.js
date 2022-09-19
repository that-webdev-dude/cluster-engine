import Container from "../cluster/core/Container";
import Rect from "../cluster/core/Rect";
import math from "../cluster/utils/math";
import Vector from "../cluster/utils/Vector";

class Arrow extends Container {
  constructor(maxLength = 100) {
    super();

    this.height = 15;
    this.background = this.add(
      new Rect({
        width: maxLength,
        height: this.height,
        style: { fill: "rgba(0, 0, 0, 0.1)" },
      })
    );
    this.arrow = this.add(
      new Rect({
        width: 4,
        height: this.height,
        style: { fill: "black" },
      })
    );

    this.pivot = new Vector(0, this.height / 2);
    this.anchor = Vector.from(this.pivot).multiply(-1);
    this.position = new Vector();
    this.maxLength = maxLength;
    this.maxDrag = 80;
    this.visible = false;
    this.angle = 0;
  }

  start(position) {
    this.position.copy(position);
    this.angle = 0;
  }

  drag(dragPosition) {
    const { position, maxLength, maxDrag } = this;
    // // calculate angle and power
    const distance = math.distance(position, dragPosition);
    const angle = -math.angle(position, dragPosition) * (180 / Math.PI) + 90;
    const power = Math.min(1, distance / maxDrag);
    this.angle = angle;
    this.arrow.width = power * maxLength;

    return { angle, power };
  }

  //   update(dt, t) {
  //     super.update(dt, t);
  //   }
}

export default Arrow;
