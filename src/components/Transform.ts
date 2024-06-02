import { Component, Vector } from "../cluster";

export class Transform extends Component {
  position: Vector;
  anchor: Vector;
  scale: Vector;
  pivot: Vector;
  angle: number;
  constructor(
    entity: string,
    position: Vector = new Vector(),
    anchor: Vector = new Vector(),
    scale: Vector = new Vector(1, 1),
    pivot: Vector = new Vector(),
    angle: number = 0
  ) {
    super(entity);
    this.position = position;
    this.anchor = anchor;
    this.scale = scale;
    this.pivot = pivot;
    this.angle = angle;
  }
}
