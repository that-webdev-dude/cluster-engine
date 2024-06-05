import { Entity } from "../../core/Entity";
import { Vector } from "../Vector";
import { Transform } from "../components/Transform";
import { Radius } from "../components/Radius";
import { Alpha } from "../components/Alpha";
import { Visibility } from "../components/Visibility";
import { ShapeStyle } from "../components/Style";

type CircleOptions = Partial<{
  position: Vector;
  anchor: Vector;
  scale: Vector;
  pivot: Vector;
  angle: number;
  radius: number;
  alpha: number;
  visible: boolean;
  style: {
    fill: string;
    stroke: string;
  };
}>;

const defaults = {
  position: new Vector(),
  anchor: new Vector(),
  scale: new Vector(1, 1),
  pivot: new Vector(),
  angle: 0,
  radius: 16,
  alpha: 1,
  visible: true,
  style: {
    fill: "lightblue",
    stroke: "transparent",
  },
};

export class Circle extends Entity {
  constructor(options: CircleOptions = {}) {
    super();
    const {
      position,
      anchor,
      scale,
      pivot,
      angle,
      radius,
      alpha,
      visible,
      style,
    } = {
      ...defaults,
      ...options,
    };
    const { fill, stroke } = style;

    this.attach(new Transform(this.id, position, anchor, scale, pivot, angle));
    this.attach(new Radius(this.id, radius));
    this.attach(new Alpha(this.id, alpha));
    this.attach(new Visibility(this.id, visible));
    this.attach(new ShapeStyle(this.id, fill, stroke));
  }
}
