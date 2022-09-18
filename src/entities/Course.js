import { Bodies, Body } from "../../vendor/matter";
import Rect from "../cluster/core/Rect";
import Vector from "../cluster/utils/Vector";

class Course extends Rect {
  constructor(position) {
    super({
      width: 1000,
      height: 20,
      style: { fill: "#eee" },
    });

    // in matter, default position and pivot are in
    // the center of the entity
    this.pivot = new Vector();
    this.pivot.x = this.width / 2;
    this.pivot.y = this.height / 2;
    this.anchor = Vector.from(this.pivot).multiply(-1);

    // 1. create the body
    const body = Bodies.rectangle(0, 0, this.width, this.height, { isStatic: true });
    Body.setPosition(body, position);
    // Body.rotate(body, Math.PI * 0.04);

    // 2. sync the body and this Rect
    this.angle = body.angle * (180 / Math.PI);
    this.position.copy(body.position);

    this.body = body;
  }
}

export default Course;
