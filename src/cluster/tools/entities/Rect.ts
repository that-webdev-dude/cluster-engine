import { Entity } from "../../core/Entity";
import { Vector } from "../Vector";
import { Transform } from "../components/Transform";
import { Size } from "../components/Size";
import { Alpha } from "../components/Alpha";
import { Visibility } from "../components/Visibility";
import { ShapeStyle } from "../components/Style";

type RectOptions = Partial<{
  position: Vector;
  anchor: Vector;
  scale: Vector;
  pivot: Vector;
  angle: number;
  width: number;
  height: number;
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
  width: 32,
  height: 32,
  alpha: 1,
  visible: true,
  style: {
    fill: "lightblue",
    stroke: "transparent",
  },
};

export class Rect extends Entity {
  constructor(options: RectOptions = {}) {
    super();
    const {
      position,
      anchor,
      scale,
      pivot,
      angle,
      width,
      height,
      alpha,
      visible,
      style,
    } = {
      ...defaults,
      ...options,
    };
    const { fill, stroke } = style;

    this.attach(new Size(this.id, width, height));
    this.attach(new Transform(this.id, position, anchor, scale, pivot, angle));
    this.attach(new Alpha(this.id, alpha));
    this.attach(new Visibility(this.id, visible));
    this.attach(new ShapeStyle(this.id, fill, stroke));
  }
}
