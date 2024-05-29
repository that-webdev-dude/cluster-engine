import { Component, Vector } from "../cluster";

export class Transform extends Component {
  position: Vector;
  scale: Vector;
  angle: number;
  constructor(
    entity: string,
    position: Vector = new Vector(),
    scale: Vector = new Vector(1, 1),
    angle: number = 0
  ) {
    super(entity);
    this.position = position;
    this.scale = scale;
    this.angle = angle;
  }
}
