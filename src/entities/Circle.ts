import { Entity, Vector } from "../cluster";
import { Radius } from "../components/Radius";
import { Transform } from "../components/Transform";
import { ShapeStyle } from "../components/Style";

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
