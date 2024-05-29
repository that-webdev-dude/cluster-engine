import { Entity, Vector } from "../cluster";
import { Radius } from "../xcomponents/Radius";
import { Transform } from "../xcomponents/Transform";
import { ShapeStyle } from "../xcomponents/Style";

type CircleOptions = Partial<{
  position: Vector;
  radius: number;
  style: Partial<{
    fill: string;
    stroke: string;
  }>;
}>;

const defaults = {
  position: new Vector(),
  radius: 16,
  style: {
    fill: "red",
    stroke: "transparent",
  },
};

export class Circle extends Entity {
  constructor(options: CircleOptions = {}) {
    super();
    const { position, radius, style } = { ...defaults, ...options };
    this.attach(new Radius(this.id, radius));
    this.attach(new Transform(this.id, position));
    this.attach(new ShapeStyle(this.id, style.fill, style.stroke));
  }
}
