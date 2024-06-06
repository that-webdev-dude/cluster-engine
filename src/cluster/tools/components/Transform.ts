import { Component } from "../../core/Component";
import { Vector } from "../Vector";

export class Transform extends Component {
  position: Vector;
  anchor: Vector;
  scale: Vector;
  pivot: Vector;
  angle: number;
  constructor(
    entity: string,
    position: Vector,
    anchor: Vector,
    scale: Vector,
    pivot: Vector,
    angle: number
  ) {
    super(entity);
    this.position = Vector.from(position);
    this.anchor = Vector.from(anchor);
    this.scale = Vector.from(scale);
    this.pivot = Vector.from(pivot);
    this.angle = angle;
  }
}
